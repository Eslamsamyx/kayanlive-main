export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface MultiField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'email' | 'phone' | 'url' | 'number' | 'range';
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface MatrixOption {
  row: string;
  column: string;
}

export interface ImageOption {
  value: string;
  label: string;
  image: string;
}

export interface AddressField {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface Question {
  id: number;
  type:
    | 'text'
    | 'textarea'
    | 'multiple-choice'
    | 'checkbox'
    | 'rating'
    | 'file-upload'
    | 'multi-field'
    | 'select'
    | 'number'
    | 'email'
    | 'phone'
    | 'url'
    | 'color'
    | 'date'
    | 'date-range'
    | 'time'
    | 'slider'
    | 'boolean'
    | 'matrix'
    | 'image-choice'
    | 'address'
    | 'signature'
    | 'drawing'
    | 'video-upload'
    | 'likert-scale'
    | 'ranking'
    | 'grid-select'
    | 'star-rating'
    | 'emoji-rating'
    | 'percentage'
    | 'currency'
    | 'location'
    | 'barcode'
    | 'qr-code';
  question: string;
  placeholder?: string;
  required?: boolean;

  // Text/Textarea specific
  maxLength?: number;
  minLength?: number;

  // Multiple choice/Checkbox/Select specific
  options?: string[] | ImageOption[];

  // Rating/Slider specific
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  labels?: string[];

  // File upload specific
  accept?: string;
  multiple?: boolean;
  maxSize?: string;

  // Multi-field specific
  fields?: MultiField[];

  // Date range specific
  startLabel?: string;
  endLabel?: string;

  // Matrix specific
  rows?: string[];
  columns?: string[];

  // Drawing specific
  canvasWidth?: number;
  canvasHeight?: number;

  // Boolean specific
  trueLabel?: string;
  falseLabel?: string;

  // Likert scale specific
  scaleLabels?: string[];

  // Ranking and checkbox specific
  minSelections?: number;
  maxSelections?: number;

  // Location specific
  defaultLocation?: { lat: number; lng: number };

  // Currency specific
  currency?: string;

  // Conditional logic
  showIf?: {
    questionId: number;
    value: string | string[];
  };

  // Validation
  validation?: {
    pattern?: string;
    message?: string;
  };

  // Help text
  helpText?: string;

  // Section grouping
  section?: string;
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  questions: Question[];
}

export interface QuestionnaireData {
  title: string;
  description: string;
  questions: Question[];
}
