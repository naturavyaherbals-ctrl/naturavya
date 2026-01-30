export function getWhatsAppSuggestion(lead: any) {
  const product =
    (Array.isArray(lead.interested_products) && lead.interested_products[0]) ||
    (Array.isArray(lead.interested_categories) && lead.interested_categories[0]) ||
    "Ayurvedic product";

  if (lead.temperature === "hot") {
    return `Namaste 🙏
Aapne ${product} ke baare me enquiry ki thi.
Ye 100% Ayurvedic formulation hai aur regular use se kaafi log positive results dekh rahe hain.
Agar aap chahein, main dosage aur delivery details turant bata deta hoon 🙂`;
  }

  if (lead.temperature === "warm") {
    return `Namaste 🙏
Aapne ${product} me interest dikhaya tha.
Ye natural herbs se bana hai aur daily routine ke saath safe hai.
Kya aap chahenge main thoda detail me explain karu?`;
  }

  return `Namaste 🙏
Aapne kuch din pehle enquiry ki thi.
Agar abhi bhi koi doubt ho ya aap information chahte ho, main madad kar sakta hoon 🙂`;
}
