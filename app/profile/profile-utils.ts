export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function categoryStyle(cat: string) {
  switch (cat) {
    case "news":
      return "text-[#7da6c6]";
    case "jobs":
      return "text-[#c78fa0]";
    case "promo":
      return "text-[#b49ac8]";
    default:
      return "text-[#8e8a84]";
  }
}

export function categoryLabel(cat: string) {
  switch (cat) {
    case "news":
      return "News";
    case "jobs":
      return "Jobs";
    case "promo":
      return "Promo";
    case "blog":
      return "Blog";
    default:
      return cat;
  }
}

export function roleLabel(role: string) {
  switch (role) {
    case "girl":
      return "Girl";
    case "client":
      return "Client";
    case "shop":
      return "Shop";
    case "admin":
      return "Admin";
    default:
      return role;
  }
}

export function workCategoryLabel(value: string | null) {
  switch (value) {
    case "ktv":
      return "KTV";
    case "massage":
      return "Massage";
    case "full_service":
      return "Full Service";
    case "escort":
      return "Escort";
    case "independent":
      return "Independent";
    default:
      return null;
  }
}