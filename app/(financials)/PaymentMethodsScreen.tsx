import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useLanguage } from '@/src/lang/LanguageContext';
import { SwipeAction } from '@/src/ui/actions/SwipeAction';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import type { PaymentMethod, PaymentType } from '@/src/interfaces/schema';
import { useDataStore } from '@/src/stores';
import { usePaymentMethods, useTableRepository } from '@/src/db';
import { PaymentMethodVisual } from '@/src/components/payments/PaymentMethodVisual';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { ColoredSelectOption } from '@/src/ui/forms/ColoredSelectOption';
import { ColorChoiceField } from '@/src/ui/forms/ColorChoiceField';
import { MoneyField } from '@/src/ui/forms/MoneyField';
import { SelectField } from '@/src/ui/forms/SelectField';
import { SwitchField } from '@/src/ui/forms/SwitchField';
import { TextField } from '@/src/ui/forms/TextField';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Screen } from '@/src/ui/primitives/Screen';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import type { PaymentType as PaymentTypeEntity } from '@/src/db/schema/generated/types';

const VISUAL_KINDS = [
  'debit_card',
  'cash',
  'piggy_bank',
  'transfer',
  'wallet',
  'gift_card',
  'other',
] as const;

const BRANDS = [
  'visa',
  'mastercard',
  'amex',
  'discover',
  'diners',
  'jcb',
  'unionpay',
  'other',
] as const;

const CARD_STYLES = ['matte', 'metallic', 'gradient', 'transparent'] as const;

const PaymentMethodsScreen = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [methodName, setMethodName] = useState('');
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [type, setType] = useState<PaymentType | null>(null);
  const [closingDate, setClosingDate] = useState(0);
  const [paidDate, setPaidDate] = useState(0);
  const [isCreditCard, setIsCreditCard] = useState(false);
  const [creditLimit, setCreditLimit] = useState(0);
  const [visualKind, setVisualKind] = useState<string>('other');
  const [cardBrand, setCardBrand] = useState<string>('other');
  const [cardStyle, setCardStyle] = useState<string>('matte');
  const [cardColor, setCardColor] = useState('#2563EB');
  const [cardLast4, setCardLast4] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardIssuer, setCardIssuer] = useState('');
  const { showToast } = useToast();
  const { PaymentMethods, setPaymentMethods, PaymentTypes, setPaymentTypes } =
    useDataStore();
  const {
    fetchPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  } = usePaymentMethods();
  const paymentTypesRepository = useTableRepository('PaymentTypes');

  useEffect(() => {
    const loadData = async () => {
      const ormData = await fetchPaymentMethods();
      setPaymentMethods(ormData);
      const types = await paymentTypesRepository.fetchAll();
      setPaymentTypes(types);
    };

    loadData();
  }, []);

  const paymentTypes = PaymentTypes ?? [];
  const paymentTypeOptions = paymentTypes.flatMap(
    (paymentType: PaymentTypeEntity) =>
      typeof paymentType.id === 'number'
        ? [{ label: paymentType.payment_type_name || '', value: paymentType.id }]
        : []
  );

  const renderTypeOption = (option: { label: string; value: number }) => (
    <ColoredSelectOption
      color={
        paymentTypes.find((paymentType) => paymentType.id === option.value)
          ?.payment_color
      }
      label={option.label}
    />
  );

  const visualOptions = useMemo(
    () =>
      VISUAL_KINDS.map((kind) => ({
        label: t(`paymentMethods.visual.${kind}` as never),
        value: kind,
      })),
    [t]
  );
  const brandOptions = useMemo(
    () =>
      BRANDS.map((brand) => ({
        label: t(`paymentMethods.brands.${brand}` as never),
        value: brand,
      })),
    [t]
  );
  const styleOptions = useMemo(
    () =>
      CARD_STYLES.map((style) => ({
        label: t(`paymentMethods.styles.${style}` as never),
        value: style,
      })),
    [t]
  );

  const isCardPieces =
    isCreditCard || visualKind === 'debit_card' || visualKind === 'gift_card';
  const previewKind = isCreditCard ? 'credit_card' : visualKind;

  const resetForm = () => {
    setMethodName('');
    setType(null);
    setClosingDate(0);
    setPaidDate(0);
    setIsCreditCard(false);
    setCreditLimit(0);
    setVisualKind('other');
    setCardBrand('other');
    setCardStyle('matte');
    setCardColor('#2563EB');
    setCardLast4('');
    setCardHolder('');
    setCardIssuer('');
    setEditingId(undefined);
  };

  const openCreate = () => {
    resetForm();
    setVisible(true);
  };

  const handleAddPaymentMethod = async () => {
    if (
      !methodName.trim() ||
      !type ||
      (isCreditCard &&
        (creditLimit <= 0 ||
          closingDate < 1 ||
          closingDate > 31 ||
          paidDate < 1 ||
          paidDate > 31))
    ) {
      showToast({ message: t('toast.empty'), type: 'warning' });
      return;
    }

    const payload = {
      method_name: methodName.trim(),
      payment_type_id: type?.id || 1,
      closing_date: isCreditCard ? closingDate : null,
      payment_date: isCreditCard ? paidDate : null,
      is_credit_card: isCreditCard ? 1 : 0,
      credit_limit: isCreditCard ? creditLimit : null,
      visual_kind: (isCreditCard ? 'credit_card' : visualKind) as
        | 'credit_card'
        | 'debit_card'
        | 'cash'
        | 'piggy_bank'
        | 'transfer'
        | 'wallet'
        | 'gift_card'
        | 'other',
      card_brand: isCardPieces ? (cardBrand as never) : null,
      card_style: isCardPieces ? (cardStyle as never) : null,
      card_color: cardColor || null,
      card_last4: isCardPieces ? cardLast4.trim() || null : null,
      card_holder: isCardPieces ? cardHolder.trim() || null : null,
      card_issuer: isCardPieces ? cardIssuer.trim() || null : null,
    };

    try {
      if (editingId) {
        await updatePaymentMethod(editingId, payload);
        showToast({ message: t('toast.edited'), type: 'success' });
      } else {
        await addPaymentMethod(payload);
        showToast({ message: t('toast.added'), type: 'success' });
      }
      const data = await fetchPaymentMethods();
      setPaymentMethods(data);
      resetForm();
      setVisible(false);
    } catch (error) {
      showToast({ message: t('toast.error'), type: 'error' });
      console.error(error);
    }
  };

  const handleDeletePaymentMethod = async (id: number | undefined) => {
    if (!id) return;
    try {
      await deletePaymentMethod(id);
      const data = await fetchPaymentMethods();
      showToast({ message: t('toast.deleted'), type: 'success' });
      setPaymentMethods(data);
    } catch (error) {
      console.error(error);
      showToast({ message: t('toast.error'), type: 'error' });
    }
  };

  const handleEditPaymentMethod = (method: PaymentMethod) => {
    const credit =
      Boolean(method.is_credit_card) ||
      (method.closing_date ?? 0) > 0 ||
      method.visual_kind === 'credit_card';
    setMethodName(method.method_name);
    setType(PaymentTypes.find((pt) => pt.id === method.payment_type_id) || null);
    setEditingId(method.id);
    setClosingDate(method.closing_date ?? 0);
    setPaidDate(method.payment_date ?? 0);
    setIsCreditCard(credit);
    setCreditLimit(method.credit_limit ?? 0);
    setVisualKind(credit ? 'credit_card' : method.visual_kind ?? 'other');
    setCardBrand(method.card_brand ?? 'other');
    setCardStyle(method.card_style ?? 'matte');
    setCardColor(
      method.card_color ??
        PaymentTypes.find((pt) => pt.id === method.payment_type_id)
          ?.payment_color ??
        '#2563EB'
    );
    setCardLast4(method.card_last4 ?? '');
    setCardHolder(method.card_holder ?? '');
    setCardIssuer(method.card_issuer ?? '');
    setVisible(true);
  };

  const handleDayChange =
    (setter: (value: number) => void) => (value: string) => {
      const day = Number(value.replace(/[^0-9]/g, ''));
      if (Number.isNaN(day) || day < 0 || day > 31) return;
      setter(day);
    };

  return (
    <Screen scroll edges={['left', 'right']}>
      <Stack gap='lg'>
        <Row justify='flex-start'>
          <Button
            label={t('paymentMethods.addMethod')}
            size='sm'
            onPress={openCreate}
            leftIcon={
              <MaterialIcons name='add' size={18} color={colors.onPrimary} />
            }
          />
        </Row>

        <Stack gap='md'>
          {PaymentMethods?.map((item) => {
            const credit =
              Boolean(item.is_credit_card) ||
              (item.closing_date ?? 0) > 0 ||
              item.visual_kind === 'credit_card';
            const kind = credit
              ? 'credit_card'
              : item.visual_kind ?? 'other';
            const color =
              item.card_color ??
              item.PaymentTypes?.payment_color ??
              colors.primary;
            const typeName = item.PaymentTypes?.payment_type_name ?? '';
            return (
              <SwipeAction
                key={item.id}
                handleDelete={() => handleDeletePaymentMethod(item.id)}
                handleUpdate={() => handleEditPaymentMethod(item)}
              >
                <Surface variant='outlined' padding='md'>
                  <Row gap='md' align='center'>
                    <View style={{ width: 116 }}>
                      <PaymentMethodVisual
                        kind={kind}
                        brand={item.card_brand}
                        style={item.card_style}
                        color={color}
                        name={item.method_name}
                        last4={item.card_last4}
                        holder={item.card_holder}
                        issuer={item.card_issuer}
                        limitCents={item.credit_limit}
                        closingDate={item.closing_date}
                        paymentDate={item.payment_date}
                        height={70}
                        compact
                      />
                    </View>
                    <Stack gap='xxs' style={{ flex: 1 }}>
                      <AppText weight='600'>{item.method_name}</AppText>
                      <AppText variant='caption' color='muted'>
                        {typeName}
                        {credit && item.credit_limit
                          ? ` · ${t('paymentMethods.creditLimit')}: ${formatMoneyWithSymbol(
                              item.credit_limit
                            )}`
                          : ''}
                      </AppText>
                      {credit ? (
                        <AppText variant='caption' color='muted'>
                          {t('credits.closingDate')}: {item.closing_date ?? '—'} ·{' '}
                          {t('credits.paidDate')}: {item.payment_date ?? '—'}
                        </AppText>
                      ) : null}
                    </Stack>
                  </Row>
                </Surface>
              </SwipeAction>
            );
          })}
        </Stack>
      </Stack>

      <Modal
        visible={visible}
        onClose={() => setVisible(false)}
        title={
          editingId
            ? t('paymentMethods.updateMethod')
            : t('paymentMethods.addMethod')
        }
        closeLabel={t('cancel')}
        scrollable
        footer={
          <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
            <Button
              label={t('cancel')}
              variant='outline'
              onPress={() => setVisible(false)}
              style={{ flex: 1 }}
            />
            <Button
              label={t('confirm')}
              onPress={handleAddPaymentMethod}
              style={{ flex: 1 }}
            />
          </View>
        }
      >
        <View style={{ gap: 16 }}>
          <View style={{ paddingVertical: 4 }}>
            <PaymentMethodVisual
              kind={previewKind}
              brand={isCardPieces ? cardBrand : null}
              style={isCardPieces ? cardStyle : null}
              color={cardColor}
              name={methodName}
              last4={isCardPieces ? cardLast4 : null}
              holder={isCardPieces ? cardHolder : null}
              issuer={isCardPieces ? cardIssuer : null}
              limitCents={isCreditCard && creditLimit > 0 ? creditLimit : null}
              closingDate={isCreditCard ? closingDate : null}
              paymentDate={isCreditCard ? paidDate : null}
              height={150}
            />
          </View>
          <TextField
            label={t('paymentMethods.methodName')}
            required
            value={methodName}
            onChangeText={setMethodName}
            placeholder={t('paymentMethods.methodName')}
          />
          <SelectField<number>
            label={t('paymentMethods.type.label')}
            required
            value={type?.id}
            title={t('paymentMethods.type.label')}
            placeholder={t('paymentMethods.type.label')}
            options={paymentTypeOptions}
            onChange={(id) =>
              setType(
                paymentTypes.find((paymentType) => paymentType.id === id) ||
                  null
              )
            }
            renderOption={renderTypeOption}
            closeLabel={t('cancel')}
          />
          <SwitchField
            label={t('paymentMethods.creditCardToggle')}
            value={isCreditCard}
            onChange={(value) => {
              setIsCreditCard(value);
              setVisualKind(value ? 'credit_card' : 'other');
            }}
          />
          {!isCreditCard ? (
            <SelectField
              label={t('paymentMethods.visualKind')}
              value={visualKind}
              options={visualOptions}
              onChange={setVisualKind}
            />
          ) : null}
          {isCreditCard ? (
            <>
              <MoneyField
                label={t('paymentMethods.creditLimit')}
                value={creditLimit}
                onChangeCents={setCreditLimit}
              />
              <TextField
                label={t('paymentMethods.closingDate')}
                required
                value={String(closingDate)}
                onChangeText={handleDayChange(setClosingDate)}
                keyboardType='number-pad'
                maxLength={2}
              />
              <TextField
                label={t('paymentMethods.paidDate')}
                required
                value={String(paidDate)}
                onChangeText={handleDayChange(setPaidDate)}
                keyboardType='number-pad'
                maxLength={2}
              />
            </>
          ) : null}
          {isCardPieces ? (
            <>
              <SelectField
                label={t('paymentMethods.cardBrand')}
                value={cardBrand}
                options={brandOptions}
                onChange={setCardBrand}
              />
              <SelectField
                label={t('paymentMethods.cardStyle')}
                value={cardStyle}
                options={styleOptions}
                onChange={setCardStyle}
              />
              <TextField
                label={t('paymentMethods.cardLast4')}
                value={cardLast4}
                onChangeText={(value) =>
                  setCardLast4(value.replace(/[^0-9]/g, '').slice(0, 4))
                }
                keyboardType='number-pad'
                maxLength={4}
              />
              <TextField
                label={t('paymentMethods.cardHolder')}
                value={cardHolder}
                onChangeText={setCardHolder}
              />
              <TextField
                label={t('paymentMethods.cardIssuer')}
                value={cardIssuer}
                onChangeText={setCardIssuer}
              />
            </>
          ) : null}
          <ColorChoiceField
            label={t('paymentMethods.cardColor')}
            value={cardColor}
            onChange={setCardColor}
          />
        </View>
      </Modal>
    </Screen>
  );
};

export default PaymentMethodsScreen;
