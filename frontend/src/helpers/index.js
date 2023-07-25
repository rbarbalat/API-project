export function reformatTime(str)
{
    let time;
    const hour = Number(str.slice(11,13));

    if(hour >= 13)
    time = `${hour - 12}${str.slice(13, 16)} pm`;

    if(hour === 12)
    time = `${str.slice(11, 16)} pm`;

    if(hour > 0 && hour < 12)
    time = `${str.slice(12, 16)} am`;

    if(hour === 0)
    time = `12${str.slice(13, 16)} am`;

    return time;
}
