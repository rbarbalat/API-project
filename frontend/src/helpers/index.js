export function reformatTime(str)
{
    //generate a string to represent time in the format "6:15 pm"
    const date = new Date(str);

    let hour = date.getHours();
    const AmPm = (hour >= 12) ? "pm" : "am";
    if(hour >= 13) hour = hour - 12;
    if(hour === 0) hour = 12;

    let minutes = date.getMinutes();
    if(minutes <= 9) minutes = `0${minutes}`;

    return `${hour}:${minutes} ${AmPm}`;
}
