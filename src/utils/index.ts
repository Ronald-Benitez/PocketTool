export const getToday = () =>{
    let date = new Date();
    let offset = date.getTimezoneOffset() * 60 * 1000; // Convertir minutos a milisegundos
    let today = new Date(date.getTime() - offset);
    return today
}