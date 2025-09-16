export default function Time() {
   const customdate = (date) =>{
      if(date){
         // Use user's local timezone instead of hardcoded 'en-US'
         return new Date(date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
          });
      } else {
         return "Null"
      }
   }

  return customdate
}
