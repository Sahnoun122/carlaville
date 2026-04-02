/**
 * Centralized form styling constants and utilities
 * Ensures consistency across all admin forms
 */

export const formStyles = {
  // Labels
  label: "text-sm font-semibold text-[#1E293B] mb-2 block",
  labelRequired: "text-sm font-semibold text-[#1E293B] mb-2 block after:content-['*'] after:ml-1 after:text-red-500",
  
  // Inputs
  input: "h-12 w-full bg-[#F8F9FA] border border-[#EDEFF2] rounded-[10px] px-4 py-2.5 font-medium text-base text-slate-800 placeholder:text-slate-400 transition-all focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
  inputSmall: "h-10 w-full bg-[#F8F9FA] border border-[#EDEFF2] rounded-[8px] px-3 py-2 font-medium text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
  inputWithIcon: "h-12 w-full bg-[#F8F9FA] border border-[#EDEFF2] rounded-[10px] px-4 py-2.5 pl-12 font-medium text-base text-slate-800 placeholder:text-slate-400 transition-all focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
  
  // Selects
  select: "h-12 w-full bg-[#F8F9FA] border border-[#EDEFF2] rounded-[10px] px-4 py-2.5 font-medium text-base text-slate-800 transition-all focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
  selectTrigger: "h-12 w-full bg-[#F8F9FA] border border-[#EDEFF2] rounded-[10px] px-4 py-2.5 font-medium text-base text-slate-800 transition-all focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
  
  // Textareas
  textarea: "w-full min-h-[120px] bg-[#F8F9FA] border border-[#EDEFF2] rounded-[10px] px-4 py-3 font-medium text-base text-slate-800 placeholder:text-slate-400 transition-all focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none",
  
  // Icons
  icon: {
    default: "text-slate-400",
    focus: "text-red-500",
    error: "text-red-500",
    success: "text-green-500",
  },
  
  // Error and help text
  error: "text-xs font-medium text-red-500 mt-1.5",
  help: "text-xs text-slate-400 mt-1 font-medium",
  
  // Containers
  formContainer: "flex flex-col h-full bg-white max-h-[85vh] overflow-hidden rounded-[16px]",
  formContent: "flex-1 overflow-y-auto px-10 py-10 space-y-10 scrollbar-hide",
  formFooter: "px-10 py-8 border-t border-slate-100 bg-white flex items-center justify-between",
  
  // Header
  formHeader: "space-y-1",
  formTitle: "text-2xl font-bold text-[#1E293B]",
  formDescription: "text-slate-400 text-sm italic",
  
  // Sections
  section: "space-y-8",
  sectionBorder: "pt-6 border-t border-slate-50",
  fieldGrid: {
    single: "space-y-4",
    double: "grid grid-cols-1 md:grid-cols-2 gap-8",
    triple: "grid grid-cols-1 sm:grid-cols-3 gap-8",
    quad: "grid grid-cols-2 sm:grid-cols-4 gap-6",
  },
  
  // Buttons
  button: {
    primary: "bg-red-700 text-white h-12 px-12 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "border-red-600 text-red-600 hover:bg-red-50 h-12 px-8 rounded-lg font-bold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    ghost: "text-slate-500 text-sm font-semibold hover:text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  },
} as const;

export const iconSize = 18;
export const iconSizeSmall = 14;
export const iconSizeLarge = 24;
