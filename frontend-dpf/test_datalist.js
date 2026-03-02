const ORGANIZATION_GROUP_ID_TO_EN = {
  pembina: "Board of Patrons",
  pengawas: "Board of Supervisors",
  pengurus: "Board of Management",
  staff: "Staff",
  relawan: "Volunteer",
  lainnya: "Others",
  direksi: "Board of Directors",
  manajemen: "Management",
  "kepala divisi": "Head of Division",
  "kepala bagian": "Head of Section",
  anggota: "Member",
};

const ORGANIZATION_GROUPS = Object.keys(ORGANIZATION_GROUP_ID_TO_EN).map((key) => {
  return key.charAt(0).toUpperCase() + key.slice(1);
});

// Simulating data from DB where user created 'wakil'
const dbData = [
    { group: 'pengurus' },
    { group: 'wakil' },
    { group: 'Pembina ' }
];

const unique = Array.from(new Set(
  dbData.map(m => {
    const raw = String(m.group ?? "").trim();
    if (!raw) return "";
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  }).filter(Boolean)
));

const dynamicGroups = unique;

const standardLower = ORGANIZATION_GROUPS.map(g => g.toLowerCase());
const filteredDynamic = dynamicGroups.filter(g => !standardLower.includes(g.toLowerCase()));

const finalDatalistOptions = [...ORGANIZATION_GROUPS, ...filteredDynamic];

console.log("ORGANIZATION_GROUPS:", ORGANIZATION_GROUPS);
console.log("dynamicGroups (from DB):", dynamicGroups);
console.log("Filtered Dynamic:", filteredDynamic);
console.log("Final Datalist:", finalDatalistOptions);
