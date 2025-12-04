export default function Time() {
   const customdate = (date) =>{
      if(date){
         const isDateOnly = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
         const d = isDateOnly ? new Date(`${date}T00:00:00Z`) : new Date(date);
         return d.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            ...(isDateOnly && { timeZone: 'UTC' })
          });
      } else {
         return "Null"
      }
   }

  return customdate
}
