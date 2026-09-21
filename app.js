/**
 * ParthDevp - Interactive GitHub Dashboard Logic
 */

const GITHUB_USERNAME = 'ParthDevp';

// Curated project information fallback (ensures immediate, robust display even if API rate-limited)
const FALLBACK_REPOS = [
  {
    name: 'Agro-Mart',
    description: 'An agriculture-based e-commerce web platform developed with Java, Spring Boot, Hibernate, and MySQL. Features comprehensive product catalog, cart management, and order workflows.',
    language: 'Java',
    stargazers_count: 0,
    forks_count: 0,
    html_url: 'https://github.com/ParthDevp/Agro-Mart',
    homepage: null,
    category: 'java',
    topics: ['java', 'spring-boot', 'hibernate', 'mysql', 'ecommerce', 'fullstack']
  },
  {
    name: 'Doctor-Patient-Portal',
    description: 'Healthcare management web system built using Java, Spring Boot, and Hibernate. Streamlines patient-doctor interaction, appointment booking, prescriptions, and health records.',
    language: 'Java',
    stargazers_count: 0,
    forks_count: 0,
    html_url: 'https://github.com/ParthDevp/Doctor-Patient-Portal',
    homepage: null,
    category: 'java',
    topics: ['java', 'spring-boot', 'hibernate', 'healthcare-portal', 'fullstack']
  },
  {
    name: 'mini-project-management-system',
    description: 'Mini Project Management REST API using Node.js, Express and MongoDB for team collaboration, tasks assignment, and project tracking.',
    language: 'JavaScript',
    stargazers_count: 1,
    forks_count: 0,
    html_url: 'https://github.com/ParthDevp/mini-project-management-system',
    homepage: null,
    category: 'api',
    topics: ['nodejs', 'express', 'mongodb', 'rest-api']
  },
  {
    name: 'Voice-assitant',
    description: 'An AI-based desktop assistant that performs tasks through voice commands: speech recognition, app launching, automated web searching, and query handling.',
    language: 'Python',
    stargazers_count: 0,
    forks_count: 0,
    html_url: 'https://github.com/ParthDevp/Voice-assitant',
    homepage: null,
    category: 'ai',
    topics: ['python', 'voice-assistant', 'speech-recognition', 'ai']
  },
  {
    name: 'Speech_Recog',
    description: 'Speech Recognition project using deep learning and audio signal processing algorithms to convert spoken words into text.',
    language: 'Jupyter Notebook',
    stargazers_count: 0,
    forks_count: 0,
    html_url: 'https://github.com/ParthDevp/Speech_Recog',
    homepage: null,
    category: 'ai',
    topics: ['speech-recognition', 'jupyter-notebook', 'deep-learning', 'python']
  },
  {
    name: 'Customer_segmentation',
    description: 'Customer segmentation analysis using unsupervised Machine Learning (K-Means clustering) to identify target consumer demographics.',
    language: 'Jupyter Notebook',
    stargazers_count: 0,
    forks_count: 0,
    html_url: 'https://github.com/ParthDevp/Customer_segmentation',
    homepage: null,
    category: 'ai',
    topics: ['machine-learning', 'clustering', 'jupyter-notebook', 'data-science']
  }
];

// Language Colors for badges and charts
const LANG_COLORS = {
  'Java': '#b07219',
  'Spring Boot': '#6db33f',
  'JavaScript': '#f1e05a',
  'Python': '#3572A5',
  'Jupyter Notebook': '#DA5B0B',
  'HTML': '#e34c26',
  'CSS': '#563d7c',
  'TypeScript': '#3178c6',
  'Other': '#8b949e'
};

// Application State
let allProjects = [];
let currentFilter = 'all';
let searchQuery = '';
let langChartInstance = null;

// DOM Elements
const projectsGrid = document.getElementById('projects-grid');
const searchInput = document.getElementById('project-search');
const filterPills = document.querySelectorAll('.pill');
const refreshBtn = document.getElementById('refresh-btn');
const copyBadgeBtn = document.getElementById('copy-badge-btn');
const copyEmailBtn = document.getElementById('copy-email-btn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
  fetchGitHubData();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderProjects();
    });
  }

  // Category filter pills
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-filter');
      renderProjects();
    });
  });

  // Refresh button
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      showToast('Refreshing live stats from GitHub...');
      fetchGitHubData(true);
    });
  }

  // Copy Profile Badge
  if (copyBadgeBtn) {
    copyBadgeBtn.addEventListener('click', () => {
      const currentUrl = window.location.href;
      const markdownBadge = `[![Interactive Dashboard](https://img.shields.io/badge/Live_Dashboard-ParthDevp-58a6ff?style=for-the-badge&logo=github&logoColor=white)](${currentUrl})`;
      navigator.clipboard.writeText(markdownBadge).then(() => {
        showToast('Badge Markdown copied to clipboard!');
      }).catch(() => {
        showToast('Could not copy to clipboard');
      });
    });
  }

  // Copy Email Button
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = 'parth.contact.dev@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast(`Copied: ${email}`);
      }).catch(() => {
        showToast('Copied email to clipboard');
      });
    });
  }
}

// Fetch GitHub Data
async function fetchGitHubData(isManualRefresh = false) {
  try {
    // 1. Fetch User Profile Details
    const userRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
    if (userRes.ok) {
      const userData = await userRes.json();
      updateProfileUI(userData);
    } else {
      console.warn('Using default profile stats (rate limit or offline)');
      updateProfileUI({
        public_repos: 6,
        location: 'India',
        bio: 'Software developer specializing in Java Full Stack development (Spring Boot, Hibernate, REST APIs) and building intelligent web applications.'
      });
    }

    // 2. Fetch Repositories
    const reposRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=100`);
    if (reposRes.ok) {
      const repos = await reposRes.json();
      allProjects = processRepoData(repos);
    } else {
      allProjects = FALLBACK_REPOS;
    }
  } catch (err) {
    console.error('Error fetching GitHub API:', err);
    allProjects = FALLBACK_REPOS;
  }

  // Compute stats and render
  computeTotalStars(allProjects);
  renderProjects();
  renderLanguageChart(allProjects);

  if (isManualRefresh) {
    showToast('GitHub metrics updated successfully!');
  }
}

// Update Profile Details in Header
function updateProfileUI(user) {
  const bioEl = document.getElementById('profile-bio');
  const locEl = document.getElementById('profile-location');
  const reposCountEl = document.getElementById('profile-repos-count');
  const statReposEl = document.getElementById('stat-repos');
  const statStackEl = document.getElementById('stat-stack');

  if (user.bio && bioEl) bioEl.textContent = user.bio;
  if (user.location && locEl) locEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${user.location}`;
  if (user.public_repos !== undefined) {
    if (reposCountEl) reposCountEl.innerHTML = `<i class="fa-solid fa-book-bookmark"></i> ${user.public_repos} Repositories`;
    if (statReposEl) statReposEl.textContent = user.public_repos;
  }
  if (statStackEl) {
    statStackEl.textContent = 'Java & Spring Boot';
  }
}

// Process repository list and categorize them
function processRepoData(repos) {
  if (!repos || !Array.isArray(repos) || repos.length === 0) {
    return FALLBACK_REPOS;
  }

  return repos
    .filter(r => !r.fork && r.name !== `${GITHUB_USERNAME}.github.io`)
    .map(r => {
      let category = 'web';
      let lang = r.language || 'Other';
      const nameLower = r.name.toLowerCase();
      const descLower = (r.description || '').toLowerCase();

      // Check for user's Java Full Stack projects (Agro-Mart, Doctor-Patient-Portal, etc.)
      if (nameLower.includes('agro') || nameLower.includes('doctor') || nameLower.includes('patient') || lang === 'Java' || descLower.includes('spring') || descLower.includes('hibernate')) {
        category = 'java';
        lang = 'Java';
      } else if (lang === 'Python' || lang === 'Jupyter Notebook' || nameLower.includes('recog') || nameLower.includes('segmentation') || nameLower.includes('assistant') || descLower.includes('machine learning') || descLower.includes('ai')) {
        category = 'ai';
      } else if (nameLower.includes('api') || nameLower.includes('server') || nameLower.includes('backend') || descLower.includes('rest api') || descLower.includes('express')) {
        category = 'api';
      } else {
        category = 'web';
      }

      // Customize descriptions for user's flagship Java & Spring Boot applications
      let description = r.description;
      if (nameLower.includes('agro')) {
        description = 'Agriculture-based e-commerce web platform developed with Java, Spring Boot, Hibernate, and MySQL with cart, product management, and order workflows.';
      } else if (nameLower.includes('doctor') || nameLower.includes('patient')) {
        description = 'Healthcare management web application engineered with Java, Spring Boot, and Hibernate for doctor-patient consultations, appointment bookings, and digital records.';
      } else if (!description) {
        description = 'No description provided.';
      }

      return {
        name: r.name,
        description: description,
        language: lang,
        stargazers_count: r.stargazers_count || 0,
        forks_count: r.forks_count || 0,
        html_url: r.html_url,
        homepage: r.homepage,
        category: category,
        topics: r.topics || []
      };
    });
}

// Compute total stars
function computeTotalStars(repos) {
  const totalStars = repos.reduce((acc, curr) => acc + (curr.stargazers_count || 0), 0);
  const starsEl = document.getElementById('stat-stars');
  if (starsEl) {
    starsEl.textContent = totalStars;
  }
}

// Render Projects to Grid
function renderProjects() {
  if (!projectsGrid) return;

  const filtered = allProjects.filter(project => {
    const matchesFilter = currentFilter === 'all' || project.category === currentFilter;
    const matchesSearch = searchQuery === '' || 
      project.name.toLowerCase().includes(searchQuery) ||
      (project.description && project.description.toLowerCase().includes(searchQuery)) ||
      (project.language && project.language.toLowerCase().includes(searchQuery));
    
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    projectsGrid.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--text-muted);"></i>
        <h3>No matching projects found</h3>
        <p>Try clearing your search query or selecting a different filter category.</p>
      </div>
    `;
    return;
  }

  projectsGrid.innerHTML = filtered.map(p => {
    const langColor = LANG_COLORS[p.language] || '#8b949e';
    const hasLiveDemo = p.homepage && p.homepage.trim().length > 0;

    return `
      <div class="project-card glass-panel">
        <div>
          <div class="project-top">
            <div class="project-folder-icon">
              <i class="fa-regular fa-folder"></i>
            </div>
            <div class="project-external-links">
              ${hasLiveDemo ? `
                <a href="${p.homepage}" target="_blank" rel="noopener noreferrer" class="project-icon-link" title="Live Preview">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
              ` : ''}
              <a href="${p.html_url}" target="_blank" rel="noopener noreferrer" class="project-icon-link" title="GitHub Repository">
                <i class="fa-brands fa-github"></i>
              </a>
            </div>
          </div>

          <h3 class="project-name">
            <a href="${p.html_url}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.name)}</a>
          </h3>

          <p class="project-desc">${escapeHtml(p.description)}</p>
        </div>

        <div class="project-footer">
          <div class="project-lang">
            <span class="lang-circle" style="background-color: ${langColor};"></span>
            <span>${p.language || 'Generic'}</span>
          </div>

          <div class="project-stats">
            <span class="project-stat-item" title="Stars">
              <i class="fa-regular fa-star"></i> ${p.stargazers_count}
            </span>
            <span class="project-stat-item" title="Forks">
              <i class="fa-solid fa-code-fork"></i> ${p.forks_count}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Languages Doughnut Chart
function renderLanguageChart(repos) {
  const canvas = document.getElementById('languageChart');
  if (!canvas) return;

  const langCounts = {};
  repos.forEach(r => {
    const lang = r.language || 'Other';
    langCounts[lang] = (langCounts[lang] || 0) + 1;
  });

  const labels = Object.keys(langCounts);
  const data = Object.values(langCounts);
  const bgColors = labels.map(l => LANG_COLORS[l] || '#8b949e');

  if (langChartInstance) {
    langChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  langChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: bgColors,
        borderWidth: 2,
        borderColor: '#0f172a'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#c9d1d9',
            font: { family: 'Outfit', size: 12 },
            boxWidth: 12,
            padding: 12
          }
        },
        tooltip: {
          backgroundColor: 'rgba(18, 24, 40, 0.95)',
          titleColor: '#58a6ff',
          bodyColor: '#f0f6fc',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1
        }
      },
      cutout: '68%'
    }
  });
}

// Utility: Show Toast Notification
let toastTimeout;
function showToast(msg) {
  if (!toast || !toastMessage) return;
  toastMessage.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// Utility: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
