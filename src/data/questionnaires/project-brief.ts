import type { Question } from '@/components/questionnaire/types';

export const projectBriefQuestionnaire = {
  id: 'project-brief',
  title: 'Project Brief Questionnaire',
  description: 'We appreciate your consideration of Kayan Live for your upcoming event. To enable us to provide a comprehensive and precise proposal with competitive pricing, we kindly request the following information:',
  estimatedTime: '15-20 minutes',
  questions: [
    // Section 1: CLIENT DETAILS
    {
      id: 1,
      type: 'text' as const,
      question: 'Company Name',
      placeholder: 'Enter your company name',
      required: true,
      section: 'Client Details',
      helpText: 'Full legal name of your company'
    },
    {
      id: 2,
      type: 'select' as const,
      question: 'Country',
      options: [
        'United Arab Emirates',
        'Saudi Arabia',
        'Qatar',
        'Kuwait',
        'Bahrain',
        'Oman',
        'Egypt',
        'Jordan',
        'Lebanon',
        'Other'
      ],
      required: true,
      section: 'Client Details'
    },
    {
      id: 3,
      type: 'select' as const,
      question: 'Industry',
      options: [
        'Technology',
        'Healthcare',
        'Finance & Banking',
        'Oil & Gas',
        'Construction',
        'Real Estate',
        'Automotive',
        'Education',
        'Government',
        'Retail',
        'Manufacturing',
        'Telecommunications',
        'Other'
      ],
      required: true,
      section: 'Client Details'
    },
    {
      id: 4,
      type: 'text' as const,
      question: 'Contact Person',
      placeholder: 'Full name of primary contact',
      required: true,
      section: 'Client Details'
    },
    {
      id: 5,
      type: 'phone' as const,
      question: 'Mobile Number',
      placeholder: '+971 50 123 4567',
      required: true,
      section: 'Client Details'
    },
    {
      id: 6,
      type: 'email' as const,
      question: 'Email Address',
      placeholder: 'contact@company.com',
      required: true,
      section: 'Client Details'
    },

    // Section 2: EVENT DETAILS
    {
      id: 7,
      type: 'text' as const,
      question: 'Event Name',
      placeholder: 'Name of the exhibition or event',
      required: true,
      section: 'Event Details'
    },
    {
      id: 8,
      type: 'date' as const,
      question: 'Event Date',
      placeholder: 'Select event start date',
      required: true,
      section: 'Event Details'
    },
    {
      id: 9,
      type: 'text' as const,
      question: 'Event Duration',
      placeholder: 'e.g., 3 days, 1 week',
      required: true,
      section: 'Event Details'
    },
    {
      id: 10,
      type: 'select' as const,
      question: 'Indoor or Outdoor',
      options: ['Indoor', 'Outdoor', 'Mixed (Indoor & Outdoor)'],
      required: true,
      section: 'Event Details'
    },
    {
      id: 11,
      type: 'text' as const,
      question: 'Build-up Days',
      placeholder: 'Number of days required for setup',
      required: false,
      section: 'Event Details'
    },
    {
      id: 12,
      type: 'file-upload' as const,
      question: 'Floor Plan',
      accept: '.pdf,.jpg,.jpeg,.png,.dwg',
      multiple: false,
      maxSize: '10MB',
      required: false,
      section: 'Event Details',
      helpText: 'Upload venue floor plan if available'
    },

    // Section 3: STAND DETAILS
    {
      id: 13,
      type: 'text' as const,
      question: 'Hall & Stand Number',
      placeholder: 'e.g., Hall 3, Stand 3A-15',
      required: false,
      section: 'Stand Details'
    },
    {
      id: 14,
      type: 'text' as const,
      question: 'Stand Dimension',
      placeholder: 'e.g., 6m x 4m, 100 sqm',
      required: true,
      section: 'Stand Details'
    },
    {
      id: 15,
      type: 'text' as const,
      question: 'Levels',
      placeholder: 'e.g., Single level, Double level',
      required: false,
      section: 'Stand Details'
    },
    {
      id: 16,
      type: 'number' as const,
      question: 'Number of Open Sides',
      placeholder: '1-4',
      min: 1,
      max: 4,
      required: true,
      section: 'Stand Details'
    },
    {
      id: 17,
      type: 'text' as const,
      question: 'Stand Orientation',
      placeholder: 'North, South, East, West facing',
      required: false,
      section: 'Stand Details'
    },
    {
      id: 18,
      type: 'text' as const,
      question: 'Maximum Height Restrictions',
      placeholder: 'e.g., 4m, 6m, No restrictions',
      required: false,
      section: 'Stand Details'
    },
    {
      id: 19,
      type: 'text' as const,
      question: 'Hanging Structure',
      placeholder: 'Describe any hanging elements needed',
      required: false,
      section: 'Stand Details'
    },
    {
      id: 20,
      type: 'text' as const,
      question: 'Rigging Points',
      placeholder: 'Ceiling mounting points available',
      required: false,
      section: 'Stand Details'
    },
    {
      id: 21,
      type: 'textarea' as const,
      question: 'Any Venue Restrictions',
      placeholder: 'Describe any specific venue limitations or requirements',
      required: false,
      section: 'Stand Details'
    },
    {
      id: 22,
      type: 'textarea' as const,
      question: 'Branding Guidelines',
      placeholder: 'Specific branding requirements or restrictions',
      required: false,
      section: 'Stand Details'
    },
    {
      id: 23,
      type: 'select' as const,
      question: 'Reuse Existing Stand',
      options: ['Yes', 'No', 'Partial'],
      required: false,
      section: 'Stand Details'
    },

    // Section 4: ACTIVATIONS
    {
      id: 24,
      type: 'number' as const,
      question: 'How many activations are planned for the event?',
      placeholder: 'Number of activations',
      min: 0,
      max: 20,
      required: false,
      section: 'Activations'
    },
    {
      id: 25,
      type: 'textarea' as const,
      question: 'Please provide the specific activations you plan to implement in your project',
      placeholder: 'Describe your planned activations in detail...',
      maxLength: 1000,
      required: false,
      section: 'Activations'
    },
    {
      id: 26,
      type: 'textarea' as const,
      question: 'Please provide the specific content to be applied in the activation',
      placeholder: 'Detail the content, messaging, and materials for your activations...',
      maxLength: 1000,
      required: false,
      section: 'Activations'
    },

    // Section 5: DESIGN REQUIREMENTS - Design Intent/Concept Design
    {
      id: 27,
      type: 'checkbox' as const,
      question: 'Design Intent/Concept Design - What do you require?',
      options: [
        'Concept/Vibe Page Only',
        'Furniture Page Only',
        '3D Sketch',
        '3D Rendered Visuals'
      ],
      required: false,
      section: 'Design Requirements - Concept',
      helpText: 'Select all design deliverables you need'
    },

    // Section 6: DESIGN REQUIREMENTS - Developed/Schematic Design
    {
      id: 28,
      type: 'checkbox' as const,
      question: 'Developed/Schematic Design - What do you require?',
      options: [
        'Concept Vibe Amends',
        'Furniture Page Amends',
        '3D Sketch',
        '3D Rendered Visual Amends',
        'Full tender presentation Amends'
      ],
      required: false,
      section: 'Design Requirements - Development',
      helpText: 'Select all development deliverables you need'
    },

    // Section 7: DESIGN REQUIREMENTS - Technical Design
    {
      id: 29,
      type: 'checkbox' as const,
      question: 'Technical Design - What do you require?',
      options: [
        'Plans',
        'Elevations',
        'Structural Calculation',
        'Detailed Drawings',
        'Graphics Package'
      ],
      required: false,
      section: 'Design Requirements - Technical',
      helpText: 'Select all technical deliverables you need'
    },

    // Section 8: STAND ZONING & SPACE MANAGEMENT
    {
      id: 30,
      type: 'matrix' as const,
      question: 'Stand Zoning & Space Management - Select required areas and specify quantities',
      rows: [
        'Mezzanine',
        'Reception',
        'Meeting Rooms',
        'Majlis',
        'Lounge',
        'Product Display',
        'Open seating area',
        'Service Pantry',
        'Media-Interview Room',
        'Offices',
        'Dining',
        'Food Presentation/Buffet',
        'Storage',
        'Bar'
      ],
      columns: ['Yes', 'No', 'Quantity'],
      required: false,
      section: 'Space Management',
      helpText: 'Indicate which areas you need and specify quantities where applicable'
    },

    // Section 9: SPACE MANAGEMENT DETAILS
    {
      id: 31,
      type: 'textarea' as const,
      question: 'Space Management Details',
      placeholder: 'Please add all questions, and client answers regarding space requirements...',
      maxLength: 2000,
      required: false,
      section: 'Space Management',
      helpText: 'Additional space planning requirements and specifications'
    },

    // Section 10: OTHER DESIGN REQUIREMENTS
    {
      id: 32,
      type: 'textarea' as const,
      question: 'Other Design Requirements',
      placeholder: 'Please specify any additional design requirements not covered above...',
      maxLength: 1000,
      required: false,
      section: 'Design Requirements - Other',
      helpText: 'Any special design considerations or requirements'
    },

    // Section 11: BRANDING REQUIREMENTS
    {
      id: 33,
      type: 'file-upload' as const,
      question: 'Branding Guidelines',
      accept: '.pdf,.jpg,.jpeg,.png,.ai,.eps',
      multiple: true,
      maxSize: '25MB',
      required: false,
      section: 'Branding Requirements',
      helpText: 'Please share the PDF file with your branding guidelines'
    },
    {
      id: 34,
      type: 'textarea' as const,
      question: 'Logo Placement Requirements',
      placeholder: 'Please note the level at each corner of the structure where logos should be placed...',
      required: false,
      section: 'Branding Requirements'
    },
    {
      id: 35,
      type: 'textarea' as const,
      question: 'Company Profile',
      placeholder: 'Please note down the company overview...',
      maxLength: 1500,
      required: false,
      section: 'Branding Requirements',
      helpText: 'Provide a comprehensive company overview for better understanding'
    },
    {
      id: 36,
      type: 'percentage' as const,
      question: 'Stand Objectives Percentage',
      placeholder: 'What percentage of objectives should the stand achieve?',
      min: 0,
      max: 100,
      step: 5,
      required: false,
      section: 'Branding Requirements'
    },

    // Section 12: LOOK & FEEL
    {
      id: 37,
      type: 'textarea' as const,
      question: 'Color Palette & Design Direction',
      placeholder: 'Please specify the desired look and feel, color palette, and corporate identity that should be considered...',
      maxLength: 1000,
      required: false,
      section: 'Look & Feel',
      helpText: 'Describe your visual preferences and brand identity'
    },
    {
      id: 38,
      type: 'select' as const,
      question: 'Style Preference',
      options: [
        'Modern & Contemporary',
        'Traditional & Classic',
        'Minimalist',
        'Industrial',
        'Luxury & Premium',
        'Tech & Futuristic',
        'Cultural & Heritage',
        'Eco-friendly & Sustainable',
        'Other'
      ],
      required: false,
      section: 'Look & Feel'
    },

    // Section 13: PROPOSAL AND BUDGET
    {
      id: 39,
      type: 'date' as const,
      question: 'Technical Proposal Deadline',
      placeholder: 'When do you need the technical proposal?',
      required: false,
      section: 'Proposal and Budget'
    },
    {
      id: 40,
      type: 'date' as const,
      question: 'Commercial Proposal Deadline',
      placeholder: 'When do you need the commercial proposal?',
      required: false,
      section: 'Proposal and Budget'
    },
    {
      id: 41,
      type: 'currency' as const,
      question: 'Budget Allocation - Stand Fabrication',
      currency: 'AED',
      placeholder: 'Budget allocated for stand fabrication',
      required: false,
      section: 'Proposal and Budget'
    },
    {
      id: 42,
      type: 'currency' as const,
      question: 'Budget Allocation - Technologies',
      currency: 'AED',
      placeholder: 'Budget allocated for technology integration',
      required: false,
      section: 'Proposal and Budget'
    },

    // Section 14: OTHER STAND REQUIREMENTS
    {
      id: 43,
      type: 'matrix' as const,
      question: 'Other Stand Requirements',
      rows: [
        'Giveaways',
        'Catering',
        'Professional coffee machine with barista',
        'Arabic coffee and dates',
        'Branded chocolates',
        'Host/Hostesses'
      ],
      columns: ['Yes', 'No', 'Details'],
      required: false,
      section: 'Other Requirements',
      helpText: 'Select additional services you require and provide details'
    },

    // Section 15: NOTES
    {
      id: 44,
      type: 'textarea' as const,
      question: 'Additional Notes',
      placeholder: 'Any additional notes, requirements, or special considerations...',
      maxLength: 2000,
      required: false,
      section: 'Notes',
      helpText: 'Include any other important information not covered above'
    },

    // Section 16: SUBMISSION DETAILS
    {
      id: 45,
      type: 'multi-field' as const,
      question: 'Submission Details',
      section: 'Submission',
      fields: [
        {
          id: 'submitterName',
          label: 'Submitted By - Name',
          type: 'text',
          placeholder: 'Full name',
          required: true
        },
        {
          id: 'submitterDesignation',
          label: 'Designation',
          type: 'text',
          placeholder: 'Job title',
          required: true
        },
        {
          id: 'submissionDate',
          label: 'Submission Date',
          type: 'date',
          required: true
        }
      ],
      required: true,
      helpText: 'Please provide submission details for record keeping'
    },

    // Section 17: DIGITAL SIGNATURE
    {
      id: 46,
      type: 'signature' as const,
      question: 'Digital Signature',
      required: true,
      section: 'Submission',
      helpText: 'Please provide your digital signature to authorize this submission'
    },

    // Section 18: REVIEW SECTION (for account manager)
    {
      id: 47,
      type: 'multi-field' as const,
      question: 'Account Manager Review (Internal Use)',
      section: 'Review',
      fields: [
        {
          id: 'reviewerName',
          label: 'Reviewed By - Name',
          type: 'text',
          placeholder: 'Account manager name',
          required: false
        },
        {
          id: 'reviewDate',
          label: 'Review Date',
          type: 'date',
          required: false
        }
      ],
      required: false,
      helpText: 'To be completed by account manager during review'
    }
  ] as Question[]
};
