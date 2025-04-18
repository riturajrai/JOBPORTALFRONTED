import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { useLoader } from '../pages/LoaderContext';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Template styles configuration
const TEMPLATES = {
  professional: {
    header: 'bg-teal-600 text-white',
    sectionTitle: 'text-teal-600 border-b-2 border-teal-100',
    text: 'text-gray-700',
    accent: 'text-teal-600',
    preview: 'bg-teal-50',
  },
  modern: {
    header: 'bg-blue-600 text-white',
    sectionTitle: 'text-blue-600 border-b-2 border-blue-100',
    text: 'text-gray-700',
    accent: 'text-blue-600',
    preview: 'bg-blue-50',
  },
  minimalist: {
    header: 'bg-gray-100 text-gray-800',
    sectionTitle: 'text-gray-800 border-b border-gray-300',
    text: 'text-gray-600',
    accent: 'text-gray-800',
    preview: 'bg-gray-50',
  },
};

// Initial resume data
const INITIAL_RESUME_DATA = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  linkedin: '',
  portfolio: '',
  summary: '',
  education: [{ degree: '', institution: '', city: '', startYear: '', endYear: '', gpa: '' }],
  experience: [{
    jobTitle: '',
    company: '',
    city: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  }],
  skills: [{ name: '', level: 'Intermediate' }],
  projects: [{ name: '', description: '', technologies: '', link: '' }],
  certifications: [{ name: '', issuer: '', date: '', credentialId: '', link: '' }],
  languages: [{ name: '', proficiency: 'Intermediate' }],
};

// Validation schema for basic fields
const VALIDATION_SCHEMA = {
  fullName: { required: true, message: 'Full name is required' },
  email: { required: true, message: 'Valid email is required', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  summary: { required: true, message: 'Professional summary is required' },
};

// Dynamic field validation configurations
const FIELD_CONFIGS = {
  education: {
    fields: [
      { name: 'degree', label: 'Degree', type: 'text', required: true },
      { name: 'institution', label: 'Institution', type: 'text', required: true },
      { name: 'city', label: 'City', type: 'text' },
      { name: 'startYear', label: 'Start Year', type: 'text', required: true },
      { name: 'endYear', label: 'End Year (or expected)', type: 'text' },
      { name: 'gpa', label: 'GPA', type: 'text' },
    ],
    default: { degree: '', institution: '', city: '', startYear: '', endYear: '', gpa: '' },
  },
  experience: {
    fields: [
      { name: 'jobTitle', label: 'Job Title', type: 'text', required: true },
      { name: 'company', label: 'Company', type: 'text', required: true },
      { name: 'city', label: 'City', type: 'text' },
      { name: 'startDate', label: 'Start Date', type: 'month', required: true },
      { name: 'endDate', label: 'End Date', type: 'month', disabledIf: (item) => item.current },
      { name: 'current', label: 'I currently work here', type: 'checkbox' },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
    ],
    default: { jobTitle: '', company: '', city: '', startDate: '', endDate: '', current: false, description: '' },
  },
  skills: {
    fields: [
      { name: 'name', label: 'Skill Name', type: 'text', required: true },
      {
        name: 'level',
        label: 'Proficiency Level',
        type: 'select',
        options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      },
    ],
    default: { name: '', level: 'Intermediate' },
  },
  projects: {
    fields: [
      { name: 'name', label: 'Project Name', type: 'text', required: true },
      { name: 'technologies', label: 'Technologies Used', type: 'text' },
      { name: 'link', label: 'Project Link', type: 'url' },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
    ],
    default: { name: '', description: '', technologies: '', link: '' },
  },
  certifications: {
    fields: [
      { name: 'name', label: 'Certification Name', type: 'text', required: true },
      { name: 'issuer', label: 'Issuing Organization', type: 'text', required: true },
      { name: 'date', label: 'Date Earned', type: 'month' },
      { name: 'credentialId', label: 'Credential ID', type: 'text' },
      { name: 'link', label: 'Verification Link', type: 'url' },
    ],
    default: { name: '', issuer: '', date: '', credentialId: '', link: '' },
  },
  languages: {
    fields: [
      { name: 'name', label: 'Language', type: 'text', required: true },
      {
        name: 'proficiency',
        label: 'Proficiency Level',
        type: 'select',
        options: ['Elementary', 'Intermediate', 'Advanced', 'Native/Fluent'],
      },
    ],
    default: { name: '', proficiency: 'Intermediate' },
  },
};

const ResumeBuilder = () => {
  const [step, setStep] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [resumeData, setResumeData] = useState(() => {
    const saved = localStorage.getItem('resumeData');
    return saved ? JSON.parse(saved) : INITIAL_RESUME_DATA;
  });
  const [errors, setErrors] = useState({});
  const resumeRef = useRef();
  const { setIsLoading } = useLoader();
  const navigate = useNavigate();

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  // Validate form for the current step
  const validateForm = () => {
    const newErrors = {};

    // Step-specific validation
    if (step === 1) {
      // Validate basic fields
      Object.entries(VALIDATION_SCHEMA).forEach(([key, rule]) => {
        if (rule.required && !resumeData[key]?.trim()) {
          newErrors[key] = rule.message;
        } else if (rule.pattern && resumeData[key] && !rule.pattern.test(resumeData[key])) {
          newErrors[key] = rule.message;
        }
      });
    } else {
      // Validate dynamic fields for the current step
      const fieldMap = {
        2: 'education',
        3: 'experience',
        4: 'skills',
        5: 'projects',
        6: 'certifications',
        7: 'languages',
      };
      const field = fieldMap[step];
      if (field) {
        resumeData[field].forEach((item, index) => {
          FIELD_CONFIGS[field].fields.forEach((f) => {
            if (f.required && !item[f.name]?.trim()) {
              newErrors[`${field}-${index}-${f.name}`] = `${f.label} is required`;
            }
          });
        });
        // Allow empty sections to proceed
        if (resumeData[field].length === 1 && resumeData[field][0].name === '' && field !== 'education' && field !== 'experience') {
          newErrors[field] = null; // Clear errors for optional sections
        }
      }
    }

    setErrors(newErrors);
    console.log('Validation errors:', newErrors); // Debugging
    return Object.keys(newErrors).length === 0;
  };

  // Handle basic input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setResumeData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Handle dynamic field changes
  const handleDynamicChange = (e, index, field, subField) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setResumeData((prev) => {
      const updated = { ...prev };
      updated[field][index][subField] = value;
      return updated;
    });
    setErrors((prev) => ({ ...prev, [`${field}-${index}-${subField}`]: '' }));
  };

  // Add new field
  const addField = (field) => {
    setResumeData((prev) => ({
      ...prev,
      [field]: [...prev[field], FIELD_CONFIGS[field].default],
    }));
  };

  // Remove field
  const removeField = (field, index) => {
    setResumeData((prev) => {
      const updated = { ...prev };
      updated[field] = updated[field].filter((_, i) => i !== index);
      return updated;
    });
  };

  // Save resume link to backend
  const saveResumeLink = async (link) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');
    if (!token || !userId) return;
    try {
      await axios.patch(`${API_BASE_URL}/users/${userId}`, { resume_link: link }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error saving resume link:', error);
    }
  };

  // Download resume as PDF
  const downloadResume = async () => {
    const input = resumeRef.current;
    if (!input) {
      alert('Resume preview is not available. Try refreshing the page.');
      return;
    }
    if (!validateForm()) {
      alert('Please fill all required fields before downloading.');
      return;
    }
    setIsLoading(true);
    try {
      input.style.width = '595pt';
      input.style.padding = '20pt';
      input.style.backgroundColor = '#ffffff';

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: process.env.NODE_ENV === 'development',
        backgroundColor: '#ffffff',
        windowWidth: 595,
        windowHeight: 842,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const elements = clonedDoc.querySelectorAll('*');
          elements.forEach((el) => {
            el.style.margin = '0';
            el.style.padding = el.style.padding || '0';
            el.style.boxSizing = 'border-box';
          });
          clonedDoc.body.style.width = '595pt';
          clonedDoc.body.style.height = 'auto';
          clonedDoc.body.style.overflow = 'visible';
        },
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `${resumeData.fullName || 'resume'}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Ensure all content is visible and try again.');
    } finally {
      setIsLoading(false);
      input.style.width = '';
      input.style.padding = '';
      input.style.backgroundColor = '';
    }
  };

  // Toggle preview mode
  const togglePreviewMode = () => {
    if (!isPreviewMode && !validateForm()) {
      alert('Please fill all required fields.');
      return;
    }
    setIsPreviewMode((prev) => !prev);
  };

  // Step navigation
  const nextStep = () => {
    if (validateForm()) {
      setStep((prev) => {
        const next = prev + 1;
        console.log('Moving to step:', next); // Debugging
        return next > 7 ? 7 : next;
      });
    } else {
      console.log('Validation failed for step:', step); // Debugging
      alert('Please fill all required fields.');
    }
  };

  const prevStep = () => {
    setStep((prev) => {
      const prevStep = prev - 1;
      console.log('Moving to step:', prevStep); // Debugging
      return prevStep < 1 ? 1 : prevStep;
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    const options = { year: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Dynamic field component
  const DynamicField = ({ field, index, data, config }) => (
    <div className="mb-6 p-4 bg-white rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {config.fields.map((f) => (
          <div key={f.name} className={f.type === 'textarea' ? 'col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {f.label}
              {f.required && <span className="text-red-600">*</span>}
            </label>
            {f.type === 'textarea' ? (
              <textarea
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                value={data[f.name]}
                onChange={(e) => handleDynamicChange(e, index, field, f.name)}
                placeholder={f.label}
                rows="4"
                required={f.required}
                aria-describedby={`${field}-${index}-${f.name}-error`}
              />
            ) : f.type === 'select' ? (
              <select
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                value={data[f.name]}
                onChange={(e) => handleDynamicChange(e, index, field, f.name)}
                aria-describedby={`${field}-${index}-${f.name}-error`}
              >
                {f.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : f.type === 'checkbox' ? (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`${field}-${index}-${f.name}`}
                  checked={data[f.name]}
                  onChange={(e) => handleDynamicChange(e, index, field, f.name)}
                  className="mr-2"
                  aria-describedby={`${field}-${index}-${f.name}-error`}
                />
                <label htmlFor={`${field}-${index}-${f.name}`} className="text-sm text-gray-700">{f.label}</label>
              </div>
            ) : (
              <input
                type={f.type}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                value={f.disabledIf && f.disabledIf(data) ? 'Present' : data[f.name]}
                onChange={(e) => handleDynamicChange(e, index, field, f.name)}
                placeholder={f.label}
                disabled={f.disabledIf && f.disabledIf(data)}
                required={f.required}
                aria-describedby={`${field}-${index}-${f.name}-error`}
              />
            )}
            {errors[`${field}-${index}-${f.name}`] && (
              <p id={`${field}-${index}-${f.name}-error`} className="text-red-600 text-xs mt-1">
                {errors[`${field}-${index}-${f.name}`]}
              </p>
            )}
          </div>
        ))}
      </div>
      {resumeData[field].length > 1 && (
        <button
          className="text-red-600 hover:underline text-sm mt-2"
          onClick={() => removeField(field, index)}
          aria-label={`Remove ${field.charAt(0).toUpperCase() + field.slice(1, -1)} entry`}
        >
          Remove {field.charAt(0).toUpperCase() + field.slice(1, -1)}
        </button>
      )}
    </div>
  );

  // Render form based on step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-teal-600">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'fullName', label: 'Full Name', type: 'text', required: true },
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'phone', label: 'Phone', type: 'tel' },
                { name: 'address', label: 'Address', type: 'text' },
                { name: 'linkedin', label: 'LinkedIn', type: 'url' },
                { name: 'portfolio', label: 'Portfolio/GitHub', type: 'url' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-600">*</span>}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={resumeData[field.name]}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                    placeholder={field.label}
                    required={field.required}
                    aria-describedby={`${field.name}-error`}
                  />
                  {errors[field.name] && (
                    <p id={`${field.name}-error`} className="text-red-600 text-xs mt-1">{errors[field.name]}</p>
                  )}
                </div>
              ))}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Summary<span className="text-red-600">*</span>
                </label>
                <textarea
                  name="summary"
                  value={resumeData.summary}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  placeholder="Briefly describe your professional background (3-5 sentences)"
                  rows="4"
                  required
                  aria-describedby="summary-error"
                />
                {errors.summary && (
                  <p id="summary-error" className="text-red-600 text-xs mt-1">{errors.summary}</p>
                )}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-teal-600">Education</h2>
            {resumeData.education.map((edu, index) => (
              <DynamicField
                key={index}
                field="education"
                index={index}
                data={edu}
                config={FIELD_CONFIGS.education}
              />
            ))}
            <button
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
              onClick={() => addField('education')}
              aria-label="Add another education entry"
            >
              Add Another Education
            </button>
          </div>
        );
      case 3:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-teal-600">Work Experience</h2>
            {resumeData.experience.map((exp, index) => (
              <DynamicField
                key={index}
                field="experience"
                index={index}
                data={exp}
                config={FIELD_CONFIGS.experience}
              />
            ))}
            <button
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
              onClick={() => addField('experience')}
              aria-label="Add another experience entry"
            >
              Add Another Experience
            </button>
          </div>
        );
      case 4:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-teal-600">Skills</h2>
            {resumeData.skills.map((skill, index) => (
              <DynamicField
                key={index}
                field="skills"
                index={index}
                data={skill}
                config={FIELD_CONFIGS.skills}
              />
            ))}
            <button
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
              onClick={() => addField('skills')}
              aria-label="Add another skill group"
            >
              Add Another Skill Group
            </button>
          </div>
        );
      case 5:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-teal-600">Projects</h2>
            {resumeData.projects.map((project, index) => (
              <DynamicField
                key={index}
                field="projects"
                index={index}
                data={project}
                config={FIELD_CONFIGS.projects}
              />
            ))}
            <button
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
              onClick={() => addField('projects')}
              aria-label="Add another project"
            >
              Add Another Project
            </button>
          </div>
        );
      case 6:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-teal-600">Certifications</h2>
            {resumeData.certifications.map((cert, index) => (
              <DynamicField
                key={index}
                field="certifications"
                index={index}
                data={cert}
                config={FIELD_CONFIGS.certifications}
              />
            ))}
            <button
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
              onClick={() => addField('certifications')}
              aria-label="Add another certification"
            >
              Add Another Certification
            </button>
          </div>
        );
      case 7:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-teal-600">Languages</h2>
            {resumeData.languages.map((lang, index) => (
              <DynamicField
                key={index}
                field="languages"
                index={index}
                data={lang}
                config={FIELD_CONFIGS.languages}
              />
            ))}
            <button
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
              onClick={() => addField('languages')}
              aria-label="Add another language"
            >
              Add Another Language
            </button>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-teal-600">Resume Template</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.keys(TEMPLATES).map((templateId) => (
                  <div
                    key={templateId}
                    className={`p-4 border-2 rounded-lg cursor-pointer ${
                      selectedTemplate === templateId ? 'border-teal-600 bg-teal-50' : 'border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(templateId)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedTemplate(templateId)}
                    aria-label={`Select ${templateId} template`}
                  >
                    <h3 className="font-medium mb-2 capitalize">{templateId}</h3>
                    <div className={`h-20 w-full ${TEMPLATES[templateId].preview} rounded mb-2`}></div>
                    <p className="text-sm text-gray-600">Preview of {templateId} template</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const templateStyles = TEMPLATES[selectedTemplate];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Resume Builder</h1>
          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              onClick={() => navigate('/dashboard')}
              aria-label="Back to dashboard"
            >
              <XMarkIcon className="h-4 w-4" />
              Back to Dashboard
            </button>
            {isPreviewMode && (
              <button
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
                onClick={downloadResume}
                aria-label="Download resume as PDF"
              >
                Download PDF
              </button>
            )}
            <button
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
              onClick={togglePreviewMode}
              aria-label={isPreviewMode ? 'Edit resume' : 'Preview resume'}
            >
              {isPreviewMode ? 'Edit Resume' : 'Preview Resume'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Form Section */}
          {!isPreviewMode && (
            <section className="w-full lg:w-1/2 bg-white p-6 rounded-lg shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-teal-600 mb-2">Progress</h2>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-teal-600 h-2.5 rounded-full"
                    style={{ width: `${(step / 7) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">Step {step} of 7</p>
              </div>
              <form onSubmit={(e) => e.preventDefault()}>
                {renderStep()}
                <div className="flex justify-between mt-6">
                  {step > 1 && (
                    <button
                      type="button"
                      className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                      onClick={prevStep}
                      aria-label="Go to previous step"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                      Back
                    </button>
                  )}
                  {step < 7 ? (
                    <button
                      type="button"
                      className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      onClick={nextStep}
                      aria-label="Go to next step"
                      disabled={Object.keys(errors).length > 0}
                    >
                      Next
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      onClick={togglePreviewMode}
                      aria-label="View final resume"
                    >
                      View Final Resume
                    </button>
                  )}
                </div>
              </form>
            </section>
          )}

          {/* Resume Preview */}
          <section
            className={`bg-white p-6 rounded-lg shadow-sm ${isPreviewMode ? 'w-full' : 'w-full lg:w-1/2'}`}
            ref={resumeRef}
            aria-label="Resume preview"
          >
            {resumeData.fullName || resumeData.email || resumeData.summary ? (
              <article>
                {/* Header */}
                <div className={`${templateStyles.header} p-6 rounded-lg mb-6`}>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">
                    {resumeData.fullName || 'Your Name'}
                  </h1>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {resumeData.email && <span>{resumeData.email}</span>}
                    {resumeData.phone && <span>• {resumeData.phone}</span>}
                    {resumeData.address && <span>• {resumeData.address}</span>}
                  </div>
                  {(resumeData.linkedin || resumeData.portfolio) && (
                    <div className="flex flex-wrap gap-2 text-sm mt-2">
                      {resumeData.linkedin && (
                        <a href={resumeData.linkedin} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                          LinkedIn
                        </a>
                      )}
                      {resumeData.portfolio && (
                        <a href={resumeData.portfolio} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                          Portfolio
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Professional Summary */}
                {resumeData.summary && (
                  <div className="mb-6">
                    <h2 className={`${templateStyles.sectionTitle} text-lg font-semibold pb-2 mb-3`}>Professional Summary</h2>
                    <p className={`${templateStyles.text} text-sm break-words`}>{resumeData.summary}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="md:col-span-2">
                    {/* Work Experience */}
                    {resumeData.experience.some((exp) => exp.jobTitle) && (
                      <div className="mb-6">
                        <h2 className={`${templateStyles.sectionTitle} text-lg font-semibold pb-2 mb-3`}>Work Experience</h2>
                        {resumeData.experience.map((exp, index) => exp.jobTitle && (
                          <div key={index} className="mb-4">
                            <div className="flex justify-between items-start flex-wrap">
                              <h3 className="font-bold text-base text-gray-800 break-words">{exp.jobTitle}</h3>
                              <p className="text-gray-600 text-xs">{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</p>
                            </div>
                            <p className="font-medium text-gray-700 break-words">{exp.company}{exp.city && `, ${exp.city}`}</p>
                            {exp.description && (
                              <ul className="list-disc pl-5 mt-2 text-gray-700 text-sm">
                                {exp.description.split('•').filter((point) => point.trim()).map((point, i) => (
                                  <li key={i} className="mb-1 break-words">{point.trim()}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Projects */}
                    {resumeData.projects.some((proj) => proj.name) && (
                      <div className="mb-6">
                        <h2 className={`${templateStyles.sectionTitle} text-lg font-semibold pb-2 mb-3`}>Projects</h2>
                        {resumeData.projects.map((project, index) => project.name && (
                          <div key={index} className="mb-4">
                            <h3 className="font-bold text-base text-gray-800 break-words">
                              {project.name}
                              {project.link && (
                                <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-xs ml-2 text-blue-600 hover:underline">
                                  (View Project)
                                </a>
                              )}
                            </h3>
                            {project.technologies && (
                              <p className="text-xs text-gray-600 mb-1 break-words">
                                <span className="font-medium">Technologies:</span> {project.technologies}
                              </p>
                            )}
                            <p className="text-gray-700 text-sm break-words">{project.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div>
                    {/* Education */}
                    {resumeData.education.some((edu) => edu.degree) && (
                      <div className="mb-6">
                        <h2 className={`${templateStyles.sectionTitle} text-lg font-semibold pb-2 mb-3`}>Education</h2>
                        {resumeData.education.map((edu, index) => edu.degree && (
                          <div key={index} className="mb-4">
                            <h3 className="font-bold text-base text-gray-800 break-words">{edu.degree}</h3>
                            <p className="text-gray-700 text-sm break-words">{edu.institution}{edu.city && `, ${edu.city}`}</p>
                            <p className="text-gray-600 text-xs break-words">
                              {edu.startYear} - {edu.endYear || 'Present'}
                              {edu.gpa && ` • GPA: ${edu.gpa}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Skills */}
                    {resumeData.skills.some((skill) => skill.name) && (
                      <div className="mb-6">
                        <h2 className={`${templateStyles.sectionTitle} text-lg font-semibold pb-2 mb-3`}>Skills</h2>
                        <ul className="space-y-1 text-sm">
                          {resumeData.skills.map((skill, index) => skill.name && (
                            <li key={index} className="break-words">
                              <span className="font-medium text-gray-800">{skill.name}</span>
                              {skill.level && (
                                <span className="text-xs text-gray-600 ml-2">({skill.level})</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Certifications */}
                    {resumeData.certifications.some((cert) => cert.name) && (
                      <div className="mb-6">
                        <h2 className={`${templateStyles.sectionTitle} text-lg font-semibold pb-2 mb-3`}>Certifications</h2>
                        <ul className="space-y-2 text-sm">
                          {resumeData.certifications.map((cert, index) => cert.name && (
                            <li key={index}>
                              <h3 className="font-medium text-gray-800 break-words">{cert.name}</h3>
                              <p className="text-gray-700 text-xs break-words">{cert.issuer}</p>
                              <div className="flex flex-wrap text-xs text-gray-600 gap-x-2">
                                {cert.date && <span>{cert.date}</span>}
                                {cert.credentialId && <span>• ID: {cert.credentialId}</span>}
                                {cert.link && (
                                  <a href={cert.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    Verify
                                  </a>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Languages */}
                    {resumeData.languages.some((lang) => lang.name) && (
                      <div className="mb-6">
                        <h2 className={`${templateStyles.sectionTitle} text-lg font-semibold pb-2 mb-3`}>Languages</h2>
                        <ul className="space-y-1 text-sm">
                          {resumeData.languages.map((lang, index) => lang.name && (
                            <li key={index} className="flex justify-between">
                              <span className="text-gray-800 break-words">{lang.name}</span>
                              <span className="text-gray-600 text-xs">{lang.proficiency}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">No Resume Content</h3>
                <p className="text-sm text-gray-600 mt-1">Add details to see your resume preview.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;