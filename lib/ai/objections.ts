export type ObjectionType =
  | 'price_high'
  | 'need_time'
  | 'not_interested'
  | 'trust_issue'
  | 'cod_doubt'
  | 'already_using'
  | 'results_doubt';

export function getObjectionReply(
  objection: ObjectionType,
  lead: any
): string {
  const name = lead.full_name || 'ji';
  const product =
    (Array.isArray(lead.interested_products) &&
      lead.interested_products[0]) ||
    'Naturavya product';

  switch (objection) {
    case 'price_high':
      return `Samajh sakta hoon ${name} 🙏  
Price thoda high lag sakta hai, lekin ${product} 100% Ayurvedic hai aur isme high-quality herbs use hote hain.  
Isliye results consistent aur safe hote hain.  
Agar aap chahen, main best value option suggest kar deta hoon 🙂`;

    case 'need_time':
      return `Bilkul ${name} 👍  
Aap araam se time lijiye.  
Main bas itna batana chahta hoon ki ${product} daily routine ke saath safe hai aur jab aap ready ho, main help ke liye available hoon 🙂`;

    case 'not_interested':
      return `Koi problem nahi ${name} 🙏  
Agar future me kabhi bhi wellness ya Ayurveda related guidance chahiye ho, Naturavya aapke liye hamesha available hai 🙂`;

    case 'trust_issue':
      return `${name}, ye bilkul valid concern hai 👍  
Naturavya ke products Ayurveda principles par based hain aur already hazaaron customers use kar rahe hain.  
Aap chahein to main customer feedback ya formulation details bhi share kar sakta hoon 🙂`;

    case 'cod_doubt':
      return `Samajh sakta hoon ${name} 🙏  
Isi liye hum COD option dete hain jahan aap payment delivery ke time karte hain.  
Sirf ek chhota confirmation process hota hai taaki fake delivery avoid ho sake 🙂`;

    case 'already_using':
      return `Bahut achha ${name} 👍  
Agar aap already koi product use kar rahe hain, main compare karke bata sakta hoon ki ${product} kis tarah se different aur beneficial hai 🙂`;

    case 'results_doubt':
      return `${name}, Ayurveda me results body-type aur routine par depend karte hain 🙂  
Isliye hum proper guidance dete hain taaki maximum benefit mile.  
Main aapko expected timeline clearly samjha deta hoon 🙏`;

    default:
      return `Samajh gaya ${name} 🙏  
Agar aap chahen to main aapke doubt ko detail me clarify kar sakta hoon 🙂`;
  }
}
