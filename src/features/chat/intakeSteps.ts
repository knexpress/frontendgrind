export type IntakeStep = {
  id: string;
  question: string;
  options: { value: string; label: string }[];
};

export const INTAKE_STEPS: IntakeStep[] = [
  {
    id: "business_type",
    question: "What type of business do you run?",
    options: [
      { value: "Product-based (physical goods)", label: "Product-based (physical goods)" },
      { value: "Service-based", label: "Service-based" },
      { value: "Food & beverage", label: "Food & beverage" },
      { value: "Online/e-commerce", label: "Online/e-commerce" },
    ],
  },
  {
    id: "reach",
    question: "Where are you based or where do you mostly operate?",
    options: [
      { value: "One city or local area", label: "One city or local area" },
      { value: "National", label: "National" },
      { value: "Cross-border / international", label: "Cross-border / international" },
      { value: "Online only", label: "Online only" },
    ],
  },
  {
    id: "goal",
    question: "What are you mainly trying to achieve right now?",
    options: [
      { value: "Grow sales or revenue", label: "Grow sales or revenue" },
      { value: "More leads or inquiries", label: "More leads or inquiries" },
      { value: "Better visibility or foot traffic", label: "Better visibility or foot traffic" },
      { value: "Launch or scale a channel", label: "Launch or scale a channel" },
    ],
  },
];
