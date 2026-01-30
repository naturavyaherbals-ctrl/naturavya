export function getFollowUpMessage(template: string, lead: any) {
  switch (template) {
    case 'not_picked_1':
      return `Namaste ${lead.full_name || 'ji'} 🙏
Aapne Naturavya ke product ke baare me enquiry ki thi.
Main thodi der pehle call kar raha/rahi tha.
Jab aap free ho, please reply kar dijiye 🙂`;

    case 'not_picked_2':
      return `Namaste 🙏
Naturavya se follow-up kar raha/rahi hoon.
Agar aapko abhi baat nahi karni ho to bas *YES* reply kar dijiye,
main convenient time par call kar lunga/lungi 🙂`;

    case 'followup_1':
      return `Namaste 🙏
Aapke last interaction ke baad main ek chhota follow-up bhej raha/rahi hoon.
Agar koi doubt ho ya information chahiye ho to please bataye 🙂`;

    case 'callback_1':
      return `Namaste 🙏
Aapne callback request ki thi.
Main thodi der me aapse call karunga/karungi.
Agar time change karna ho to reply kar dijiye 🙂`;

    default:
      return null;
  }
}
