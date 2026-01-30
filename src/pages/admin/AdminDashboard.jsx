// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import {
  FiBook,
  FiUsers,
  FiBarChart2,
  FiClock,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiLogOut,
  FiUpload,
  FiEye,
  FiActivity,
  FiTrendingUp,
  FiFileText,
  FiRefreshCw,
  FiX,
  FiCheck,
  FiList,
  FiType,
  FiCode,
  FiDownload,
  FiCopy,
  FiFile,
  FiTrash,
  FiChevronDown,
  FiChevronUp,
  FiExternalLink
} from 'react-icons/fi';
import { FaUserShield, FaBrain, FaMarkdown, FaRegCopy, FaQuestionCircle, FaFileAlt, FaFileUpload } from 'react-icons/fa';
import { GrTextAlignFull } from 'react-icons/gr';

const AdminDashboard = () => {
  const { admin, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [modules, setModules] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewModuleForm, setShowNewModuleForm] = useState(false);
  const [error, setError] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedModulePreview, setSelectedModulePreview] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({}); // Store uploaded file content by section ID
  

// New module form state
  const [newModule, setNewModule] = useState({
    name: '',
    subject: '',
    unit: '',
    topic: '',
    difficulty_level: 'beginner',
    expected_completion_time: 30,
    bloom_taxonomy_target: 'understanding',
    description: ''
  });
  
  // Structured content state
  const [contentSections, setContentSections] = useState([
    {
      id: Date.now(),
      type: 'concept',
      title: 'Introduction',
      content: '', // Will be populated from uploaded file
      file: null, // Store file reference
      fileName: '',
      questions: [],
      practiceProblems: []
    }
  ]);
  
  // Mastery check state
  const [masteryCheck, setMasteryCheck] = useState({
    questions: []
  });

  useEffect(() => {
    console.log('AdminDashboard mounted. Admin state:', admin);
    if (isLoading) {
      return;
    }
    if (!admin) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [admin, navigate, isLoading]);

 const fetchDashboardData = async () => {
    setLoading(true);
    try {
        // We use Promise.all to get everything at once, just like you had it.
        // NOTE: We do NOT pass authConfig because cookies are automatic now.
        const [statsRes, modulesRes, analyticsRes] = await Promise.all([
            api.get('admin/dashboard/stats/'),
            api.get('admin-modules/'),
            api.get('admin/analytics/')
        ]);

        // Log this so you can see the data flowing in the console
        console.log("Stats Data:", statsRes.data);
        console.log("Modules Data:", modulesRes.data);

        setStats(statsRes.data);
        setModules(modulesRes.data);
        setAnalytics(analyticsRes.data);
      
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        
        // If one fails, they all fail in Promise.all. 
        // Check if the error is specifically a 403 (Permission)
        if (err.response?.status === 403) {
            console.error("403 Forbidden: Your user is logged in but lacks 'Staff' status.");
        }
    } finally {
        setLoading(false);
    }
};
  // Add new content section
  const addContentSection = () => {
    const newSection = {
      id: Date.now(),
      type: 'concept',
      title: `Section ${contentSections.length + 1}`,
      content: '',
      file: null,
      fileName: '',
      questions: [],
      practiceProblems: []
    };
    setContentSections([...contentSections, newSection]);
  };

  // Update content section
  const updateContentSection = (id, field, value) => {
    setContentSections(contentSections.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  // Handle file upload for content
  const handleFileUpload = (id, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Check file type
    const allowedTypes = [
      'text/plain', 
      'text/markdown', 
      'application/pdf', 
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/html'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md')) {
      alert('Please upload a supported file type: .txt, .md, .pdf, .doc, .docx, .html');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      let content = e.target.result;
      
      // For PDF files, we can't extract text easily in frontend
      // So we'll store a reference and handle it differently
      if (file.type === 'application/pdf') {
        content = `[PDF File: ${file.name}] - Uploaded PDF content. For full content, view the uploaded file.`;
      }

      // Update the section with file content
      setContentSections(contentSections.map(section => 
        section.id === id ? { 
          ...section, 
          content: content,
          file: file,
          fileName: file.name,
          fileType: file.type
        } : section
      ));

      // Store the file content separately for preview
      setUploadedFiles(prev => ({
        ...prev,
        [id]: {
          content: content,
          fileName: file.name,
          fileType: file.type,
          file: file
        }
      }));
    };

    if (file.type === 'application/pdf') {
      // For PDFs, we'll just store the file reference
      reader.readAsDataURL(file); // Read as base64 for storage
    } else {
      reader.readAsText(file);
    }
  };

  // Remove uploaded file
  const removeFile = (id) => {
    setContentSections(contentSections.map(section => 
      section.id === id ? { 
        ...section, 
        content: '',
        file: null,
        fileName: '',
        fileType: ''
      } : section
    ));

    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[id];
      return newFiles;
    });
  };

  // Preview uploaded file
  const previewFile = (id) => {
    const fileData = uploadedFiles[id];
    if (!fileData) return;

    // For PDFs, open in new tab if it's a data URL
    if (fileData.fileType === 'application/pdf' && fileData.content.startsWith('data:application/pdf')) {
      window.open(fileData.content, '_blank');
      return;
    }

    // For text files, show in modal
    const fileContent = fileData.content;
    const blob = new Blob([fileContent], { type: fileData.fileType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    URL.revokeObjectURL(url);
  };

  // Download uploaded file
  const downloadFile = (id) => {
    const fileData = uploadedFiles[id];
    if (!fileData) return;

    const blob = fileData.fileType === 'application/pdf' && fileData.content.startsWith('data:application/pdf')
      ? dataURLtoBlob(fileData.content)
      : new Blob([fileData.content], { type: fileData.fileType || 'text/plain' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileData.fileName || `section-${id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper function to convert data URL to blob
  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Remove content section
  const removeContentSection = (id) => {
    if (contentSections.length > 1) {
      setContentSections(contentSections.filter(section => section.id !== id));
      
      // Clean up uploaded files for removed section
      setUploadedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[id];
        return newFiles;
      });
    }
  };

  // Move section up
  const moveSectionUp = (index) => {
    if (index === 0) return;
    const newSections = [...contentSections];
    [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    setContentSections(newSections);
  };

  // Move section down
  const moveSectionDown = (index) => {
    if (index === contentSections.length - 1) return;
    const newSections = [...contentSections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    setContentSections(newSections);
  };

  // Handle questions with answers
  // Update these functions in your main AdminDashboard component:

// Handle questions with answers
// Inside AdminDashboard.jsx
const updateSectionQuestions = (id, questionsText) => {
  // We split by newline but DO NOT filter out empty strings while typing
  // This allows the 'Enter' key to actually create a new line in the array
  const questions = questionsText.split('\n').map(q => {
    const parts = q.split('|');
    const questionText = parts[0] || ''; 
    const answerText = parts[1] || '';
    
    // We only trim for the final data, but keep the structure 
    // so the UI doesn't jump while typing the '|' symbol
    return {
      question: questionText.trim(),
      answer: answerText.trim(),
      userAnswer: '',
      isCorrect: null,
      points: 1 
    };
  });

  updateContentSection(id, 'questions', questions);
};

// Handle practice problems with answers
const updateSectionPracticeProblems = (id, problemsText) => {
  const problems = problemsText.split('\n')
    .filter(p => p.trim())
    .map(p => {
      // Check if problem already exists
      const existingProblem = contentSections
        .find(s => s.id === id)
        ?.practiceProblems?.find(existing => existing.problem === p.split('|')[0]?.trim());
      
      if (existingProblem) {
        return existingProblem;
      }
      
      // Parse problem and answer from format: "Problem | Solution"
      const parts = p.split('|');
      const problem = parts[0]?.trim() || p.trim();
      const answer = parts[1]?.trim() || '';
      
      return {
        problem: problem,
        answer: answer,
        userAnswer: '',
        isCorrect: null,
        points: 2 // Default points per problem
      };
    });
  updateContentSection(id, 'practiceProblems', problems);
};

// Handle mastery check questions with answers
const updateMasteryCheckQuestions = (questionsText) => {
  const questions = questionsText.split('\n')
    .filter(q => q.trim())
    .map(q => {
      // Parse question and answer from format: "Question? | Answer"
      const parts = q.split('|');
      const question = parts[0]?.trim() || q.trim();
      const answer = parts[1]?.trim() || '';
      
      return {
        question: question,
        answer: answer,
        userAnswer: '',
        isCorrect: null,
        points: 3 // More points for mastery questions
      };
    });
  setMasteryCheck({ questions });
};

  // Copy section
  const copySection = (id) => {
    const sectionToCopy = contentSections.find(section => section.id === id);
    if (sectionToCopy) {
      const newSection = {
        ...sectionToCopy,
        id: Date.now(),
        title: `${sectionToCopy.title} (Copy)`,
        file: null, // Don't copy the file reference
        fileName: ''
      };
      const index = contentSections.findIndex(s => s.id === id);
      const newSections = [...contentSections];
      newSections.splice(index + 1, 0, newSection);
      setContentSections(newSections);
    }
  };

  // Preview module
  const previewModule = () => {
    const moduleData = {
      name: newModule.name || 'Untitled Module',
      subject: newModule.subject || 'General',
      contents: contentSections.map(section => ({
        ...section,
        content: section.content || section.fileName || 'No content uploaded',
        questions: Array.isArray(section.questions) ? section.questions : [],
        practiceProblems: Array.isArray(section.practiceProblems) ? section.practiceProblems : []
      })),
      mastery_check: masteryCheck
    };
    setSelectedModulePreview(moduleData);
    setPreviewMode(true);
  };

  // Export module as JSON
  const exportModule = () => {
    const moduleData = {
      name: newModule.name,
      subject: newModule.subject,
      unit: newModule.unit,
      topic: newModule.topic,
      difficulty_level: newModule.difficulty_level,
      expected_completion_time: newModule.expected_completion_time,
      bloom_taxonomy_target: newModule.bloom_taxonomy_target,
      description: newModule.description,
      contents: contentSections.map(section => ({
        type: section.type,
        title: section.title,
        content: section.content || `[Uploaded file: ${section.fileName || 'No file'}]`,
        fileName: section.fileName,
        fileType: section.fileType,
        questions: Array.isArray(section.questions) ? section.questions : [],
        practiceProblems: Array.isArray(section.practiceProblems) ? section.practiceProblems : []
      })),
      mastery_check: {
        questions: Array.isArray(masteryCheck.questions) ? masteryCheck.questions : []
      }
    };
    
    const dataStr = JSON.stringify(moduleData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${newModule.name || 'module'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import module from JSON
  const importModule = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Set basic module info
        setNewModule({
          name: importedData.name || '',
          subject: importedData.subject || '',
          unit: importedData.unit || '',
          topic: importedData.topic || '',
          difficulty_level: importedData.difficulty_level || 'beginner',
          expected_completion_time: importedData.expected_completion_time || 30,
          bloom_taxonomy_target: importedData.bloom_taxonomy_target || 'understanding',
          description: importedData.description || ''
        });
        
        // Set content sections
        if (importedData.contents && Array.isArray(importedData.contents)) {
          setContentSections(importedData.contents.map((content, index) => ({
            id: Date.now() + index,
            type: content.type || 'concept',
            title: content.title || `Section ${index + 1}`,
            content: content.content || '',
            fileName: content.fileName || '',
            fileType: content.fileType || '',
            questions: Array.isArray(content.questions) ? content.questions : [],
            practiceProblems: Array.isArray(content.practiceProblems) ? content.practiceProblems : []
          })));
        }
        
        // Set mastery check
        if (importedData.mastery_check && importedData.mastery_check.questions) {
          setMasteryCheck({
            questions: Array.isArray(importedData.mastery_check.questions) ? 
              importedData.mastery_check.questions : []
          });
        }
        
        alert('Module imported successfully! Note: File uploads need to be re-uploaded.');
      } catch (error) {
        alert('Error importing module: Invalid JSON format');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

 // Create module with structured content
  const handleCreateModule = async (e) => {
  e.preventDefault();
  
  if (!newModule.name || !newModule.subject) {
    alert('Please fill in required fields');
    return;
  }

  // Use FormData to allow file uploads
  const formData = new FormData();
  
  // Append basic fields
  formData.append('name', newModule.name);
  formData.append('subject', newModule.subject);
  formData.append('unit', newModule.unit || 'general');
  formData.append('topic', newModule.topic || 'general');
  formData.append('difficulty_level', newModule.difficulty_level);
  formData.append('expected_completion_time', parseInt(newModule.expected_completion_time));
  formData.append('bloom_taxonomy_target', newModule.bloom_taxonomy_target || 'understand');

  // Handle the PDF File specifically
  // Assuming 'pdf_file' is the key in your Django Model
  if (newModule.pdf_file) {
    formData.append('pdf_file', newModule.pdf_file);
  }

  // Complex objects (JSONFields) must be stringified when using FormData
  formData.append('contents', JSON.stringify(contentSections));
  formData.append('mastery_check', JSON.stringify(masteryCheck));

  try {
    // Note: Do NOT set Content-Type manually; Axios does it for FormData
    const response = await api.post('admin-modules/', formData);
    
    alert('Module created successfully with PDF!');
    setShowNewModuleForm(false);
    fetchDashboardData(); // Refresh list
  } catch (error) {
    console.error('Detailed Error:', error.response?.data);
    alert('Failed to create: ' + JSON.stringify(error.response?.data || error.message));
  }
};

  // Upload files to server
  const uploadFilesToServer = async (moduleId, sections) => {
    const token = admin?.token;
    
    for (const section of sections) {
      if (section.file) {
        const formData = new FormData();
        formData.append('module_id', moduleId);
        formData.append('section_id', section.id);
        formData.append('file', section.file);
        formData.append('section_title', section.title);
        
        try {
          const response = await api.post('/upload-content-file/', formData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            }
          });
          console.log(`File uploaded for section ${section.id}:`, response.data);
        } catch (error) {
          console.error(`Error uploading file for section ${section.id}:`, error);
        }
      }
    }
  };

  const handleDeleteModule = async (id) => {
    if (window.confirm('Are you sure you want to delete this module? This will permanently remove it from the system.')) {
      try {
        const token = admin?.token;
        const authConfig = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };

        const response = await api.delete(`/admin-modules/${id}/`, authConfig);
        
        console.log('Delete response:', response.data);
        
        if (response.data.message) {
          alert(response.data.message);
        }
        
        fetchDashboardData();
        
      } catch (error) {
        console.error('Error deleting module:', error);
        console.error('Error details:', error.response?.data);
        
        let errorMessage = 'Failed to delete module. ';
        
        if (error.response?.data?.error) {
          errorMessage += error.response.data.error;
        } else if (error.response?.data?.detail) {
          errorMessage += error.response.data.detail;
        } else {
          errorMessage += error.message;
        }
        
        alert(errorMessage);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // View module details
  const handleViewModule = (module) => {
    const previewData = {
      name: module.name,
      subject: module.subject,
      contents: module.contents || [],
      difficulty_level: module.difficulty_level,
      bloom_taxonomy_target: module.bloom_taxonomy_target
    };
    setSelectedModulePreview(previewData);
    setPreviewMode(true);
  };

  // Edit module
  const handleEditModule = (module) => {
    setShowNewModuleForm(true);
    setNewModule({
      name: module.name,
      subject: module.subject,
      unit: module.unit || '',
      topic: module.topic || '',
      difficulty_level: module.difficulty_level || 'beginner',
      expected_completion_time: module.expected_completion_time || 30,
      bloom_taxonomy_target: module.bloom_taxonomy_target || 'understanding',
      description: module.description || ''
    });
    
    if (module.contents && Array.isArray(module.contents)) {
      setContentSections(module.contents.map((content, index) => ({
        id: Date.now() + index,
        type: content.type || 'concept',
        title: content.title || `Section ${index + 1}`,
        content: content.content || '',
        fileName: content.fileName || '',
        fileType: content.fileType || '',
        questions: Array.isArray(content.questions) ? content.questions.map(q => ({
          question: q.question,
          answer: q.answer,
          points: q.points || 1,
          userAnswer: '',
          isCorrect: null
        })) : [],
        practiceProblems: Array.isArray(content.practice_problems) ? content.practice_problems.map(p => ({
          problem: p.problem,
          answer: p.answer,
          points: p.points || 2,
          userAnswer: '',
          isCorrect: null
        })) : []
      })));
    }
    
    if (module.mastery_check && module.mastery_check.questions) {
      setMasteryCheck({
        questions: Array.isArray(module.mastery_check.questions) ? module.mastery_check.questions.map(q => ({
          question: q.question,
          answer: q.answer,
          points: q.points || 3,
          userAnswer: '',
          isCorrect: null
        })) : []
      });
    }
    
    // Scroll to form
    window.scrollTo({
      top: document.getElementById('module-form')?.offsetTop || 0,
      behavior: 'smooth'
    });
  };

  // Duplicate module
  const handleDuplicateModule = async (module) => {
    try {
      const token = admin?.token;
      const authConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const duplicateData = {
        name: `${module.name} (Copy)`,
        subject: module.subject,
        unit: module.unit,
        topic: module.topic,
        description: module.description,
        difficulty_level: module.difficulty_level,
        expected_completion_time: module.expected_completion_time,
        bloom_taxonomy_target: module.bloom_taxonomy_target,
        contents: module.contents || [],
        mastery_check: module.mastery_check || { questions: [] }
      };

      const response = await api.post('/admin-modules/', duplicateData, authConfig);
      
      if (response.data) {
        alert('Module duplicated successfully!');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error duplicating module:', error);
      alert('Failed to duplicate module. Please try again.');
    }
  };

  // Toggle module active status
  const toggleModuleStatus = async (module) => {
    try {
      const token = admin?.token;
      const authConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const updateData = {
        ...module,
        is_active: !module.is_active
      };

      const response = await api.put(`/admin-modules/${module.id}/`, updateData, authConfig);
      
      if (response.data) {
        alert(`Module ${updateData.is_active ? 'activated' : 'deactivated'} successfully!`);
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error toggling module status:', error);
      alert('Failed to update module status. Please try again.');
    }
  };

  // File upload progress component
  const FileUploadProgress = ({ fileName, fileType, fileSize }) => {
    const [uploadProgress, setUploadProgress] = useState(0);
    
    useEffect(() => {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
      
      return () => clearInterval(interval);
    }, []);
    
    return (
      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <FiFile className="text-blue-600 mr-2" />
            <div>
              <div className="text-sm font-medium text-blue-700">{fileName}</div>
              <div className="text-xs text-blue-600">
                {fileType} • {(fileSize / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>
          <div className="text-sm font-medium text-blue-700">{uploadProgress}%</div>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <FaUserShield className="text-purple-600 text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MetaMind Admin</h1>
                <p className="text-gray-600 text-sm">
                  Welcome, {admin?.username} • System Administrator
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchDashboardData}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Preview Modal */}
      {previewMode && selectedModulePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Module Preview</h3>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedModulePreview.name}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {selectedModulePreview.subject}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded capitalize">
                    {selectedModulePreview.difficulty_level || 'medium'}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded capitalize">
                    Bloom: {selectedModulePreview.bloom_taxonomy_target || 'understanding'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-6">
                {selectedModulePreview.contents.map((section, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          section.type === 'concept' ? 'bg-purple-100 text-purple-700' :
                          section.type === 'example' ? 'bg-blue-100 text-blue-700' :
                          section.type === 'practice' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {section.type?.toUpperCase() || 'CONTENT'}
                        </span>
                        <h5 className="ml-3 text-lg font-semibold text-gray-900">{section.title}</h5>
                      </div>
                      <span className="text-sm text-gray-500">Section {index + 1}</span>
                    </div>
                    
                    {/* File info if uploaded */}
                    {section.fileName && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FiFile className="text-blue-600 mr-2" />
                            <div>
                              <div className="font-medium text-blue-700">{section.fileName}</div>
                              <div className="text-sm text-blue-600">{section.fileType || 'File'}</div>
                            </div>
                          </div>
                          <div className="text-sm text-blue-600">
                            Uploaded
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="prose max-w-none mb-4 bg-gray-50 p-4 rounded-lg">
                      {section.content ? (
                        <pre className="whitespace-pre-wrap text-gray-700 text-sm">
                          {section.content.length > 1000 
                            ? `${section.content.substring(0, 1000)}... [Content truncated. View full content in study session.]`
                            : section.content
                          }
                        </pre>
                      ) : (
                        <p className="text-gray-500 italic">No content available for this section.</p>
                      )}
                    </div>
                    
                    {(section.questions?.length > 0 || section.practiceProblems?.length > 0) && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        {section.questions?.length > 0 && (
                          <div className="mb-4">
                            <h6 className="font-medium text-gray-700 mb-2">Review Questions:</h6>
                            <ul className="list-disc ml-5 text-gray-600">
                              {section.questions.map((q, qIdx) => (
                                <li key={qIdx} className="mb-1">
                                  <div className="font-medium">{q.question}</div>
                                  {q.answer && (
                                    <div className="text-sm text-green-600 mt-1">
                                      <strong>Answer:</strong> {q.answer}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {section.practiceProblems?.length > 0 && (
                          <div>
                            <h6 className="font-medium text-gray-700 mb-2">Practice Problems:</h6>
                            <ul className="list-disc ml-5 text-gray-600">
                              {section.practiceProblems.map((p, pIdx) => (
                                <li key={pIdx} className="mb-1">
                                  <div className="font-medium">{p.problem}</div>
                                  {p.answer && (
                                    <div className="text-sm text-green-600 mt-1">
                                      <strong>Answer:</strong> {p.answer}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setPreviewMode(false)}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FiBook className="text-purple-600" />}
            title="Total Modules"
            value={stats?.total_modules || 0}
            description="Study materials"
          />
          <StatCard
            icon={<FiUsers className="text-blue-600" />}
            title="Students"
            value={stats?.total_students || 0}
            description="Registered users"
          />
          <StatCard
            icon={<FiClock className="text-green-600" />}
            title="Study Sessions"
            value={stats?.total_sessions || 0}
            description="All time"
          />
          <StatCard
            icon={<FiActivity className="text-orange-600" />}
            title="Today's Sessions"
            value={stats?.today_sessions || 0}
            description="Today"
          />
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {['overview', 'modules', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow p-6">
          {activeTab === 'overview' && (
            <OverviewTab 
              stats={stats} 
              modules={modules} 
              analytics={analytics}
              handleViewModule={handleViewModule}
            />
          )}

          {activeTab === 'modules' && (
            <ModulesTab
              modules={modules}
              showNewModuleForm={showNewModuleForm}
              newModule={newModule}
              setNewModule={setNewModule}
              setShowNewModuleForm={setShowNewModuleForm}
              contentSections={contentSections}
              setContentSections={setContentSections}
              masteryCheck={masteryCheck}
              setMasteryCheck={setMasteryCheck}
              addContentSection={addContentSection}
              removeContentSection={removeContentSection}
              updateContentSection={updateContentSection}
              updateSectionQuestions={updateSectionQuestions}
              updateSectionPracticeProblems={updateSectionPracticeProblems}
              updateMasteryCheckQuestions={updateMasteryCheckQuestions}
              handleCreateModule={handleCreateModule}
              handleDeleteModule={handleDeleteModule}
              handleViewModule={handleViewModule}
              handleEditModule={handleEditModule}
              handleDuplicateModule={handleDuplicateModule}
              toggleModuleStatus={toggleModuleStatus}
              moveSectionUp={moveSectionUp}
              moveSectionDown={moveSectionDown}
              copySection={copySection}
              previewModule={previewModule}
              exportModule={exportModule}
              importModule={importModule}
              handleFileUpload={handleFileUpload}
              removeFile={removeFile}
              previewFile={previewFile}
              downloadFile={downloadFile}
              uploadedFiles={uploadedFiles}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab analytics={analytics} />
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, description }) => (
  <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        <p className="text-gray-500 text-sm mt-1">{description}</p>
      </div>
      <div className="p-3 bg-gray-100 rounded-lg">
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  </div>
);

// Overview Tab Component
const OverviewTab = ({ stats, modules, analytics, handleViewModule }) => (
  <div>
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">System Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
            <FiUpload className="mr-2" />
            Recent Modules
          </h3>
          {modules && modules.length > 0 ? (
            <ul className="space-y-3">
              {modules.slice(0, 3).map((module, index) => (
                <li key={module.id || index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium">{module.name}</p>
                    <p className="text-sm text-gray-500">{module.subject}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {new Date(module.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleViewModule(module)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <FiEye />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No modules created yet</p>
          )}
        </div>
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
            <FiTrendingUp className="mr-2" />
            Popular Subjects
          </h3>
          {analytics?.popular_subjects?.length > 0 ? (
            <ul className="space-y-2">
              {analytics.popular_subjects.slice(0, 3).map((subject, index) => (
                <li key={index} className="flex items-center justify-between py-2">
                  <span className="font-medium">{subject.subject}</span>
                  <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                    {subject.count} sessions
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No subject data available</p>
          )}
        </div>
      </div>
    </div>

    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Modules</h2>
      {modules && modules.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content Sections
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {modules.slice(0, 5).map((module) => (
                <tr key={module.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{module.name}</div>
                    <div className="text-sm text-gray-500">
                      Created: {new Date(module.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {module.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                    {module.difficulty_level}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      module.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {module.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">
                      {module.contents?.length || 0} sections
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewModule(module)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View module"
                      >
                        <FiEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <FiBook className="text-gray-400 text-4xl mx-auto mb-4" />
          <p className="text-gray-500">No modules created yet</p>
          <p className="text-gray-400 text-sm mt-2">Create your first module using the Modules tab</p>
        </div>
      )}
    </div>
  </div>
);

// Modules Tab Component
const ModulesTab = ({
  modules,
  showNewModuleForm,
  newModule,
  setNewModule,
  setShowNewModuleForm,
  contentSections,
  setContentSections,
  masteryCheck,
  setMasteryCheck,
  addContentSection,
  removeContentSection,
  updateContentSection,
  updateSectionQuestions,
  updateSectionPracticeProblems,
  updateMasteryCheckQuestions,
  handleCreateModule,
  handleDeleteModule,
  handleViewModule,
  handleEditModule,
  handleDuplicateModule,
  toggleModuleStatus,
  moveSectionUp,
  moveSectionDown,
  copySection,
  previewModule,
  exportModule,
  importModule,
  handleFileUpload,
  removeFile,
  previewFile,
  downloadFile,
  uploadedFiles
  
}) => {
  const [rawTextState, setRawTextState] = useState({
    review: {},   // for section review questions
    practice: {}, // for section practice problems
    mastery: {}   // for module mastery check
  });

  // Now your JSX can use rawTextState
  return (
  
  <div id="module-form">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold text-gray-900">Study Modules Management</h2>
      <button
        onClick={() => setShowNewModuleForm(true)}
        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        <FiPlus className="mr-2" />
        Add New Module
      </button>
    </div>

    {showNewModuleForm && (
      <div className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create New Module</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={previewModule}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <FiEye className="mr-1" />
              Preview
            </button>
            <button
              onClick={exportModule}
              className="px-3 py-1 text-sm text-green-600 hover:text-green-800 flex items-center"
            >
              <FiDownload className="mr-1" />
              Export
            </button>
            <label className="px-3 py-1 text-sm text-purple-600 hover:text-purple-800 flex items-center cursor-pointer">
              <FiUpload className="mr-1" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importModule}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setShowNewModuleForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleCreateModule} className="space-y-6">
          {/* Basic Module Information */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-3 flex items-center">
              <FiType className="mr-2" />
              Module Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newModule.name}
                  onChange={(e) => setNewModule({...newModule, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter module name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newModule.subject}
                  onChange={(e) => setNewModule({...newModule, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Mathematics, Physics"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  value={newModule.unit}
                  onChange={(e) => setNewModule({...newModule, unit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Algebra, Calculus"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  value={newModule.topic}
                  onChange={(e) => setNewModule({...newModule, topic: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Quadratic Equations"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newModule.description}
                  onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brief description of the module"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={newModule.difficulty_level}
                  onChange={(e) => setNewModule({...newModule, difficulty_level: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Time (minutes)
                </label>
                <input
                  type="number"
                  value={newModule.expected_completion_time}
                  onChange={(e) => setNewModule({...newModule, expected_completion_time: parseInt(e.target.value) || 30})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bloom's Taxonomy Target
                </label>
                <select
                  value={newModule.bloom_taxonomy_target}
                  onChange={(e) => setNewModule({...newModule, bloom_taxonomy_target: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="remembering">Remembering</option>
                  <option value="understanding">Understanding</option>
                  <option value="applying">Applying</option>
                  <option value="analyzing">Analyzing</option>
                  <option value="evaluating">Evaluating</option>
                  <option value="creating">Creating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-700 flex items-center">
                <GrTextAlignFull className="mr-2" />
                Content Sections ({contentSections.length})
              </h4>
              <button
                type="button"
                onClick={addContentSection}
                className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
              >
                <FiPlus className="mr-1" />
                Add Section
              </button>
            </div>
            
            <div className="space-y-4">
              {contentSections.map((section, index) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700">Section {index + 1}</span>
                      <span className="ml-3 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded capitalize">
                        {section.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <button
                          type="button"
                          onClick={() => moveSectionUp(index)}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSectionDown(index)}
                          disabled={index === contentSections.length - 1}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                      <select
                        value={section.type}
                        onChange={(e) => updateContentSection(section.id, 'type', e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="concept">Concept</option>
                        <option value="example">Example</option>
                        <option value="practice">Practice</option>
                        <option value="info">Information</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => copySection(section.id)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Duplicate section"
                      >
                        <FaRegCopy />
                      </button>
                      {contentSections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContentSection(section.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remove section"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateContentSection(section.id, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter section title"
                      />
                    </div>
                    
                    {/* File Upload Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content File <span className="text-red-500">*</span>
                        <span className="ml-2 text-xs text-gray-500">
                          (Upload .txt, .md, .pdf, .doc, .docx, .html files)
                        </span>
                      </label>
                      
                      {section.fileName ? (
                        <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <FiFile className="text-green-600 mr-3" />
                              <div>
                                <div className="font-medium text-green-700">{section.fileName}</div>
                                <div className="text-sm text-green-600">
                                  {section.fileType || 'Unknown type'} • 
                                  {section.file ? ` ${(section.file.size / 1024).toFixed(1)} KB` : ''}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => previewFile(section.id)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Preview file"
                              >
                                <FiExternalLink />
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadFile(section.id)}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Download file"
                              >
                                <FiDownload />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeFile(section.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Remove file"
                              >
                                <FiTrash />
                              </button>
                            </div>
                          </div>
                          
                          {/* Show preview for text files */}
                          {section.fileType && !section.fileType.includes('pdf') && !section.fileType.includes('doc') && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-600">Content Preview:</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const textarea = document.getElementById(`preview-${section.id}`);
                                    textarea.classList.toggle('h-40');
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Toggle Preview
                                </button>
                              </div>
                              <textarea
                                id={`preview-${section.id}`}
                                value={section.content.length > 1000 ? `${section.content.substring(0, 1000)}... [Content truncated]` : section.content}
                                readOnly
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm h-20 resize-none"
                              />
                              <div className="text-xs text-gray-500 mt-1">
                                {section.content.length} characters
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <FaFileUpload className="text-4xl text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 mb-2">Drag and drop your content file here, or click to browse</p>
                          <p className="text-sm text-gray-500 mb-4">
                            Supports: .txt, .md, .pdf, .doc, .docx, .html (Max 5MB)
                          </p>
                          <label className="cursor-pointer">
                            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
                              <FiUpload className="mr-2" />
                              Choose File
                              <input
                                type="file"
                                onChange={(e) => handleFileUpload(section.id, e)}
                                className="hidden"
                                accept=".txt,.md,.pdf,.doc,.docx,.html,text/plain,text/markdown,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/html"
                              />
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Review Questions & Answers
                          <span className="ml-2 text-xs text-gray-500">(Format: Question? | Answer)</span>
                        </label>
                       <textarea
  value={
    // ✅ Use optional chaining and fallback to the serialized questions
    rawTextState.review?.[section.id] ?? 
    (section.questions || []).map(q => `${q.question} | ${q.answer}`).join('\n')
  }
  onChange={(e) => {
    const val = e.target.value;
    setRawTextState(prev => ({
      ...prev,
      review: { 
        ...(prev.review || {}),  // ✅ make sure prev.review exists
        [section.id]: val 
      }
    }));
    updateSectionQuestions(section.id, val);
  }}
/>

                        <div className="flex justify-between mt-1">
                          <div className="text-xs text-gray-500">
                            {Array.isArray(section.questions) ? section.questions.length : 0} questions
                          </div>
                          <div className="text-xs text-gray-500">
                            Enter each question on a new line. Add answer after "|"
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Practice Problems & Answers
                          <span className="ml-2 text-xs text-gray-500">(Format: Problem | Solution)</span>
                        </label>
                       <textarea
  value={
    rawTextState.practice?.[section.id] ?? 
    (section.practiceProblems || []).map(p => `${p.problem} | ${p.solution}`).join('\n')
  }
  onChange={(e) => {
    const val = e.target.value;
    setRawTextState(prev => ({
      ...prev,
      practice: { 
        ...(prev.practice || {}), 
        [section.id]: val 
      }
    }));
    updateSectionPracticeProblems(section.id, val);
  }}
/>

                        <div className="flex justify-between mt-1">
                          <div className="text-xs text-gray-500">
                            {Array.isArray(section.practiceProblems) ? section.practiceProblems.length : 0} problems
                          </div>
                          <div className="text-xs text-gray-500">
                            Enter each problem on a new line. Add answer after "|"
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mastery Check */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-3 flex items-center">
              <FiCheck className="mr-2" />
              Mastery Check Questions
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Questions for Mastery Assessment
                <span className="ml-2 text-xs text-gray-500">(Format: Question? | Answer)</span>
              </label>
             <textarea
  value={
    rawTextState.mastery?.['mastery'] ?? 
    (masteryCheck.questions || []).map(q => `${q.question} | ${q.answer}`).join('\n')
  }
  onChange={(e) => {
    const val = e.target.value;
    setRawTextState(prev => ({
      ...prev,
      mastery: { 
        ...(prev.mastery || {}), 
        ['mastery']: val 
      }
    }));
    updateMasteryCheckQuestions(val);
  }}
/>

              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">
                  These questions will be used to assess student mastery of the module
                </p>
                <div className="text-xs text-gray-500">
                  {Array.isArray(masteryCheck.questions) ? masteryCheck.questions.length : 0} questions
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowNewModuleForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <FiUpload className="mr-2" />
              Create Module
            </button>
          </div>
        </form>
      </div>
    )}

    {/* Modules List */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Modules ({modules?.length || 0})</h3>
      {modules && modules.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject / Unit / Topic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {modules.map((module) => (
                <tr key={module.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{module.name}</div>
                      <div className="text-sm text-gray-500">
                        {module.difficulty_level} • {module.expected_completion_time} min
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Bloom: {module.bloom_taxonomy_target}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {module.subject}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Unit: {module.unit || 'general'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Topic: {module.topic || 'general'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {module.contents?.length || 0} sections
                      </div>
                      <div className="text-gray-500">
                        {module.mastery_check?.questions?.length || 0} mastery questions
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleModuleStatus(module)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                        module.is_active 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                      title="Click to toggle status"
                    >
                      {module.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewModule(module)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View module"
                      >
                        <FiEye />
                      </button>
                      <button 
                        onClick={() => handleEditModule(module)}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Edit module"
                      >
                        <FiEdit />
                      </button>
                      <button 
                        onClick={() => handleDuplicateModule(module)}
                        className="text-purple-600 hover:text-purple-900 p-1"
                        title="Duplicate module"
                      >
                        <FiCopy />
                      </button>
                      <button 
                        onClick={() => handleDeleteModule(module.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete module"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FiBook className="text-gray-400 text-4xl mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
          <p className="text-gray-500 mb-6">Create your first study module to get started</p>
          <button
            onClick={() => setShowNewModuleForm(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FiPlus className="mr-2" />
            Create First Module
          </button>
        </div>
      )}
    </div>
  </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ analytics }) => (
  <div>
    <h2 className="text-xl font-bold text-gray-900 mb-6">System Analytics</h2>
    
    {analytics ? (
      <div className="space-y-8">
        {/* Weekly Activity */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiActivity className="mr-2" />
              Weekly Activity
            </h3>
            <div className="text-2xl font-bold text-purple-600">
              {analytics.weekly_sessions || 0}
            </div>
          </div>
          <p className="text-gray-600">Study sessions in the last 7 days</p>
        </div>

        {/* Module Usage */}
        {analytics.module_usage?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Used Modules</h3>
            <div className="space-y-4">
              {analytics.module_usage.slice(0, 5).map((module, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <FaBrain className="text-purple-600 mr-3" />
                      <div>
                        <h4 className="font-medium">{module.name}</h4>
                        <p className="text-sm text-gray-500">
                          Used {module.usage_count || 0} times
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {Math.round((module.total_duration || 0) / 60)} min
                      </div>
                      <div className="text-sm text-gray-500">total time</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(((module.usage_count || 0) / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Students */}
        {analytics.active_students?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Students</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.active_students.slice(0, 6).map((student, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <FiUsers className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{student.username}</p>
                      <p className="text-sm text-gray-500">
                        {student.session_count || 0} study sessions
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Subjects */}
        {analytics.popular_subjects?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Subjects</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analytics.popular_subjects.slice(0, 4).map((subject, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {subject.count || 0}
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    {subject.subject}
                  </div>
                  <div className="text-xs text-gray-500">sessions</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ) : (
      <div className="text-center py-12">
        <FiFileText className="text-gray-400 text-4xl mx-auto mb-4" />
        <p className="text-gray-500">Analytics data not available yet</p>
        <p className="text-gray-400 text-sm mt-2">Data will appear as students use the platform</p>
      </div>
    )}
  </div>
);

export default AdminDashboard;