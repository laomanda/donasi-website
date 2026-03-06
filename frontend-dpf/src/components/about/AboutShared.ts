import {
  faHandshakeSimple,
  faHeartPulse,
  faShieldHalved,
  faSquareCheck,
} from "@fortawesome/free-solid-svg-icons";

export type ValueCard = {
  title: string;
  desc: string;
  icon: any;
};

export type TimelineItem = {
  year: string;
  title: string;
  desc: string;
};

export type OrganizationMember = {
  id: number;
  name: string;
  position_title: string;
  group: string | null;
  group_en?: string | null;
  photo_path?: string | null;
  show_contact?: boolean;
  email?: string | null;
  phone?: string | null;
  order: number;
};

export const MISSION_ITEM_KEYS = [
  "about.mission.item1",
  "about.mission.item2",
  "about.mission.item3",
  "about.mission.item4",
  "about.mission.item5",
];

export const VALUE_ITEMS: ValueCard[] = [
  { title: "about.values.trust.title", desc: "about.values.trust.desc", icon: faShieldHalved },
  { title: "about.values.transparency.title", desc: "about.values.transparency.desc", icon: faSquareCheck },
  { title: "about.values.collaboration.title", desc: "about.values.collaboration.desc", icon: faHandshakeSimple },
  { title: "about.values.sustainability.title", desc: "about.values.sustainability.desc", icon: faHeartPulse },
];

export const TIMELINE: (TimelineItem & { titleKey: string; descKey: string; yearKey?: string })[] = [
  {
    year: "2010",
    title: "",
    desc: "",
    titleKey: "about.timeline.2010.title",
    descKey: "about.timeline.2010.desc",
  },
  {
    year: "2015",
    title: "",
    desc: "",
    titleKey: "about.timeline.2015.title",
    descKey: "about.timeline.2015.desc",
  },
  {
    year: "2020",
    title: "",
    desc: "",
    titleKey: "about.timeline.2020.title",
    descKey: "about.timeline.2020.desc",
  },
  {
    year: "2022",
    title: "",
    desc: "",
    titleKey: "about.timeline.2022.title",
    descKey: "about.timeline.2022.desc",
  },
  {
    year: "",
    yearKey: "about.timeline.now.year",
    title: "",
    desc: "",
    titleKey: "about.timeline.now.title",
    descKey: "about.timeline.now.desc",
  },
];

export const LEGAL_ITEM_KEYS = [
  "about.legal.item1",
  "about.legal.item2",
  "about.legal.item3",
  "about.legal.item4",
  "about.legal.item5",
  "about.legal.item6",
  "about.legal.item7",
  "about.legal.item8",
  "about.legal.item9",
  "about.legal.item10",
];

export const GROUP_LABEL_KEYS: Record<string, string> = {
  pembina: "about.team.group.pembina",
  pengawas: "about.team.group.pengawas",
  pengurus: "about.team.group.pengurus",
  staff: "about.team.group.staff",
  relawan: "about.team.group.relawan",
  lainnya: "about.team.group.lainnya",
};

export const GROUP_ORDER = ["pembina", "pengawas", "pengurus", "staff", "relawan", "lainnya"];
