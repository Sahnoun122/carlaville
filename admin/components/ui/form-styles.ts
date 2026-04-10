/**
 * Centralized form styling constants and utilities
 * Ensures consistency across all admin forms
 */

export const formStyles = {
  // Labels
  label: "text-sm font-semibold text-[#1E293B] mb-2 block sm:text-[0.9375rem]",
  labelRequired: "text-sm font-semibold text-[#1E293B] mb-2 block after:content-['*'] after:ml-1 after:text-red-500 sm:text-[0.9375rem]",
  
  // Inputs
  input: "h-11 sm:h-12 w-full bg-[#F8F9FA] border border-[#EDEFF2] rounded-[10px] px-3 sm:px-4 py-3 sm:py-3.5 font-medium text-sm sm:text-base text-slate-800 placeholder:text-slate-400 transition-all focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
  inputSmall: "h-10 w-full bg-[#F8F9FA] border border-[#EDEFF2] rounded-[8px] px-3 py-2 font-medium text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
  inputWithIcon: "h-11 sm:h-12 w-full bg-[#F8F9FA] border border-[#EDEFF2] rounded-[10px] px-3 sm:px-4 py-3 sm:py-3.5 pl-11 sm:pl-12 font-medium text-sm sm:text-base text-slate-800 placeholder:text-slate-400 transition-all focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
  
  // Selects
  select: "h-11 sm:h-12 w-full bg-[#F8F9FA] border border-[#EDEFF2] rounded-[10px] px-3 sm:px-4 py-3 sm:py-3.5 font-medium text-sm sm:text-base text-slate-800 transition-all focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
  selectTrigger: "h-11 sm:h-12 w-full bg-[#F8F9FA] border border-[#EDEFF2] rounded-[10px] px-3 sm:px-4 py-3 sm:py-3.5 font-medium text-sm sm:text-base text-slate-800 transition-all focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
  
  // Textareas
  textarea: "w-full min-h-[110px] sm:min-h-[120px] bg-[#F8F9FA] border border-[#EDEFF2] rounded-[10px] px-3 sm:px-4 py-3 sm:py-3.5 font-medium text-sm sm:text-base text-slate-800 placeholder:text-slate-400 transition-all focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none",
  
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
  formContainer: "flex h-full max-h-[85vh] flex-col overflow-hidden rounded-[20px] bg-white shadow-sm",
  formContent: "flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide sm:px-6 sm:py-8 lg:px-10 lg:py-10 lg:space-y-10",
  formFooter: "flex flex-col-reverse gap-4 border-t border-slate-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:px-10 lg:py-8",
  
  // Header
  formHeader: "space-y-1",
  formTitle: "text-2xl font-bold text-[#1E293B]",
  formDescription: "text-slate-400 text-sm italic",
  
  // Sections
  section: "space-y-6 sm:space-y-8",
  sectionBorder: "pt-6 border-t border-slate-50",
  fieldGrid: {
    single: "space-y-4",
    double: "grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2",
    triple: "grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3",
    quad: "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4",
  },
  
  // Buttons
  button: {
    primary: "bg-red-700 text-white h-11 sm:h-12 px-6 sm:px-12 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "border-red-600 text-red-600 hover:bg-red-50 h-11 sm:h-12 px-5 sm:px-8 rounded-lg font-bold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    ghost: "text-slate-500 text-sm font-semibold hover:text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  },
} as const;

export const iconSize = 18;
export const iconSizeSmall = 14;
export const iconSizeLarge = 24;
