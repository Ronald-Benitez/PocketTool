import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useShoppingListsRepository } from '@/src/db';
import { mapDatabaseError } from '@/src/db/errors';
import {
  parseReceiptBlocks,
  type ReceiptScan,
} from '@/src/domain/shopping/receipt';
import {
  formatQuantity,
  parseQuantityInput,
  SHOPPING_UNITS,
  type ShoppingUnit,
} from '@/src/domain/shopping/units';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { IconButton } from '@/src/ui/actions/IconButton';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { LoadingState } from '@/src/ui/feedback/LoadingState';
import { MoneyField } from '@/src/ui/forms/MoneyField';
import { SelectField } from '@/src/ui/forms/SelectField';
import { TextField } from '@/src/ui/forms/TextField';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { radii } from '@/src/ui/theme/tokens';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

type ReceiptDraft = {
  key: string;
  include: boolean;
  name: string;
  priceCents: number | null;
  quantity: string;
  unit: ShoppingUnit;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreated: (
    listId: number,
    initialAmountCents: number | null,
    initialDate: number | null
  ) => void;
};

const formatReceiptDate = (value: number): string => {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

const mapShoppingError = (message: string): string | null => {
  if (!message.startsWith('SHOPPING_')) return null;
  const suffix = message.slice('SHOPPING_'.length).toLowerCase();
  return suffix.replace(/_([a-z])/g, (_, letter: string) =>
    letter.toUpperCase()
  );
};

export const ReceiptScanModal = ({ visible, onClose, onCreated }: Props) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const repository = useShoppingListsRepository();

  const [step, setStep] = useState<'source' | 'processing' | 'review'>(
    'source'
  );
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<ReceiptDraft[]>([]);
  const [listName, setListName] = useState('');
  const [receiptTotalCents, setReceiptTotalCents] = useState<number | null>(
    null
  );
  const [receiptDate, setReceiptDate] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setStep('source');
    setImageUri(null);
    setDrafts([]);
    setListName('');
    setReceiptTotalCents(null);
    setReceiptDate(null);
    setError(null);
    setPermissionDenied(false);
    setBusy(false);
  }, [visible]);

  const includes = drafts.filter(
    (draft) => draft.include && draft.name.trim().length > 0
  );
  const calculatedTotalCents = includes.reduce(
    (total, draft) => total + (draft.priceCents ?? 0),
    0
  );

  const buildListName = useCallback(
    (scan: ReceiptScan) => {
      const date = scan.date ? formatReceiptDate(scan.date) : null;
      if (scan.merchant && date) return `${scan.merchant} · ${date}`;
      if (scan.merchant) return scan.merchant;
      if (date) return `${t('shopping.scan.defaultName')} ${date}`;
      return t('shopping.scan.defaultName');
    },
    [t]
  );

  const processImage = useCallback(
    async (uri: string) => {
      setImageUri(uri);
      setStep('processing');
      setError(null);
      try {
        const ocr = await import('expo-mlkit-ocr');
        if (!ocr.isSupported()) {
          setError(t('shopping.scan.unsupported'));
          setStep('source');
          return;
        }
        const result = await ocr.recognizeText(uri);
        const scan = parseReceiptBlocks(result.blocks);
        const nextDrafts: ReceiptDraft[] = scan.items.map((item, index) => ({
          key: `ocr-${index}-${item.name}`,
          include: true,
          name: item.name,
          priceCents: item.priceCents,
          quantity:
            item.quantity != null ? formatQuantity(item.quantity) : '',
          unit: (item.unit as ShoppingUnit) ?? 'unit',
        }));
        setDrafts(nextDrafts);
        setReceiptTotalCents(scan.totalCents);
        setReceiptDate(scan.date);
        setListName(buildListName(scan));
        setStep('review');
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : '';
        const key = /native module|ExpoMlkitOcr/i.test(message)
          ? 'requiresBuild'
          : 'ocrFailed';
        setError(t(`shopping.scan.${key}` as never));
        setStep('source');
      }
    },
    [buildListName, t]
  );

  const takePhoto = async () => {
    setPermissionDenied(false);
    setError(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setPermissionDenied(true);
      setError(t('shopping.scan.cameraDenied'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets?.[0]) return;
    await processImage(result.assets[0].uri);
  };

  const pickFromGallery = async () => {
    setPermissionDenied(false);
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPermissionDenied(true);
      setError(t('shopping.scan.galleryDenied'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets?.[0]) return;
    await processImage(result.assets[0].uri);
  };

  const updateDraft = (key: string, patch: Partial<ReceiptDraft>) => {
    setDrafts((current) =>
      current.map((draft) =>
        draft.key === key ? { ...draft, ...patch } : draft
      )
    );
  };

  const addDraft = () => {
    setDrafts((current) => [
      ...current,
      {
        key: `manual-${Date.now()}-${current.length}`,
        include: true,
        name: '',
        priceCents: null,
        quantity: '',
        unit: 'unit',
      },
    ]);
  };

  const createList = async () => {
    setError(null);
    if (!listName.trim()) {
      setError(t('shopping.scan.listNameRequired'));
      return;
    }
    if (includes.length === 0) {
      setError(t('shopping.scan.noIncluded'));
      return;
    }
    if (includes.some((draft) => !draft.name.trim())) {
      setError(t('shopping.scan.emptyItemName'));
      return;
    }

    try {
      setBusy(true);
      const parsed = includes.map((draft) => {
        const quantity = draft.quantity.trim()
          ? parseQuantityInput(draft.quantity)
          : null;
        if (draft.quantity.trim() && quantity == null) {
          throw new Error('INVALID_QUANTITY');
        }
        return {
          item_name: draft.name.trim(),
          price_cents: draft.priceCents,
          quantity,
          unit: quantity != null ? draft.unit : null,
          is_checked: true,
        };
      });

      const listId = await repository.createListWithItems({
        list_name: listName.trim(),
        items: parsed,
        status: 'closed',
        purchase_date: receiptDate,
      });
      const initialAmount =
        receiptTotalCents ??
        (calculatedTotalCents > 0 ? calculatedTotalCents : null);
      onCreated(listId, initialAmount, receiptDate);
    } catch (cause) {
      if (cause instanceof Error && cause.message === 'INVALID_QUANTITY') {
        setError(t('shopping.scan.invalidQuantity'));
      } else {
        const message = cause instanceof Error ? cause.message : '';
        const key = mapShoppingError(message);
        if (key) {
          setError(t(`shopping.errors.${key}` as never));
        } else {
          const mapped = mapDatabaseError(cause, t('toast.error'));
          setError(t(`dbErrors.${mapped.code}` as never));
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const title =
    step === 'review'
      ? t('shopping.scan.reviewTitle')
      : step === 'processing'
        ? t('shopping.scan.processing')
        : t('shopping.scan.title');

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      closeLabel={t('cancel')}
      placement='bottom'
      scrollable
      maxWidth={560}
      footer={
        step === 'review' ? (
          <Row gap='sm' style={styles.footer}>
            <Button
              label={t('cancel')}
              variant='outline'
              onPress={onClose}
              disabled={busy}
              style={styles.footerButton}
            />
            <Button
              label={t('shopping.scan.create')}
              onPress={createList}
              loading={busy}
              disabled={includes.length === 0 || !listName.trim()}
              style={styles.footerButton}
            />
          </Row>
        ) : undefined
      }
    >
      {step === 'processing' ? (
        <LoadingState message={t('shopping.scan.processing')} />
      ) : step === 'source' ? (
        <Stack gap='md'>
          <AppText variant='body'>{t('shopping.scan.sourceHint')}</AppText>
          {error ? <InlineMessage variant='error' message={error} /> : null}
          {permissionDenied ? (
            <Button
              label={t('shopping.scan.openSettings')}
              variant='outline'
              onPress={() => Linking.openSettings()}
            />
          ) : null}
          <Row gap='sm'>
            <Button
              label={t('shopping.scan.takePhoto')}
              onPress={takePhoto}
              style={styles.footerButton}
            />
            <Button
              label={t('shopping.scan.gallery')}
              variant='outline'
              onPress={pickFromGallery}
              style={styles.footerButton}
            />
          </Row>
        </Stack>
      ) : (
        <Stack gap='md'>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode='contain'
              accessibilityLabel={t('shopping.scan.imageHint')}
            />
          ) : null}
          <TextField
            label={t('shopping.scan.listName')}
            value={listName}
            onChangeText={setListName}
            required
          />
          <AppText variant='caption' color='muted'>
            {t('shopping.scan.reviewHint')}
          </AppText>

          <Surface variant='muted' padding='sm'>
            <Row justify='space-between'>
              <AppText variant='caption' color='muted'>
                {t('shopping.scan.totalReceipt')}
              </AppText>
              <AppText variant='body'>
                {receiptTotalCents == null
                  ? '—'
                  : formatMoneyWithSymbol(receiptTotalCents)}
              </AppText>
            </Row>
            <Row justify='space-between'>
              <AppText variant='caption' color='muted'>
                {t('shopping.scan.totalCalculated')}
              </AppText>
              <AppText variant='body'>
                {formatMoneyWithSymbol(calculatedTotalCents)}
              </AppText>
            </Row>
          </Surface>

          {receiptTotalCents == null ? (
            <InlineMessage
              variant='info'
              message={t('shopping.scan.totalMissing', {
                calculated: formatMoneyWithSymbol(calculatedTotalCents),
              })}
            />
          ) : Math.abs(calculatedTotalCents - receiptTotalCents) > 1 ? (
            <InlineMessage
              variant='warning'
              message={t('shopping.scan.totalMismatch', {
                calculated: formatMoneyWithSymbol(calculatedTotalCents),
                receipt: formatMoneyWithSymbol(receiptTotalCents),
              })}
            />
          ) : null}

          {drafts.length === 0 ? (
            <InlineMessage
              variant='warning'
              message={t('shopping.scan.noItems')}
            />
          ) : null}

          {drafts.map((draft, index) => (
            <Surface key={draft.key} variant='outlined' padding='sm'>
              <Stack gap='xs'>
                <Row gap='xs' align='center'>
                  <IconButton
                    icon={
                      <Ionicons
                        name={
                          draft.include
                            ? 'checkmark-circle'
                            : 'ellipse-outline'
                        }
                        size={24}
                        color={
                          draft.include
                            ? colors.success
                            : colors.textMuted ?? colors.text
                        }
                      />
                    }
                    label={t('shopping.scan.toggleInclude', {
                      name: draft.name || `#${index + 1}`,
                    })}
                    size='sm'
                    selected={draft.include}
                    onPress={() =>
                      updateDraft(draft.key, { include: !draft.include })
                    }
                  />
                  <View style={styles.grow}>
                    <TextField
                      value={draft.name}
                      onChangeText={(value) =>
                        updateDraft(draft.key, { name: value })
                      }
                      placeholder={t('shopping.item.namePlaceholder')}
                      accessibilityLabel={t('shopping.item.name')}
                    />
                  </View>
                  <IconButton
                    icon={
                      <Ionicons
                        name='trash-outline'
                        size={18}
                        color={colors.danger ?? colors.text}
                      />
                    }
                    label={t('shopping.scan.removeItem')}
                    size='sm'
                    onPress={() =>
                      setDrafts((current) =>
                        current.filter((item) => item.key !== draft.key)
                      )
                    }
                  />
                </Row>
                <MoneyField
                  label={t('shopping.item.price')}
                  value={draft.priceCents ?? 0}
                  onChangeCents={(value) =>
                    updateDraft(draft.key, {
                      priceCents: value > 0 ? value : null,
                    })
                  }
                  accessibilityLabel={t('shopping.item.price')}
                />
                <Row gap='sm'>
                  <TextField
                    label={t('shopping.item.quantity')}
                    value={draft.quantity}
                    onChangeText={(value) =>
                      updateDraft(draft.key, { quantity: value })
                    }
                    placeholder={t('shopping.item.quantity')}
                    accessibilityLabel={t('shopping.item.quantity')}
                    keyboardType='decimal-pad'
                    containerStyle={styles.grow}
                  />
                  <SelectField<ShoppingUnit>
                    label={t('shopping.item.unit')}
                    value={draft.unit}
                    options={SHOPPING_UNITS.map((code) => ({
                      value: code,
                      label: t(`shopping.item.units.${code}` as never),
                    }))}
                    onChange={(value) =>
                      updateDraft(draft.key, { unit: value })
                    }
                    placeholder={t('shopping.item.unit')}
                    containerStyle={styles.grow}
                  />
                </Row>
              </Stack>
            </Surface>
          ))}

          <Button
            label={t('shopping.scan.addItem')}
            variant='outline'
            onPress={addDraft}
          />
          {error ? <InlineMessage variant='error' message={error} /> : null}
        </Stack>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  footer: { flex: 1 },
  footerButton: { flex: 1 },
  grow: { flex: 1 },
  image: {
    width: '100%',
    height: 160,
    borderRadius: radii.md,
    backgroundColor: 'transparent',
  },
});
