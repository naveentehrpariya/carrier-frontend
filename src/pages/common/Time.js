export default function Time() {
   const customdate = (date) =>{
      if(date){
         return new Date(date).toLocaleDateString('en-US', {
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
