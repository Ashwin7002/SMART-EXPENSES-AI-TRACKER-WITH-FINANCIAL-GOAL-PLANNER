/**
 * SMART EXPENSES AI TRACKER WITH FINANCIAL GOAL PLANNER
 * Core Application Engine & State Controller
 * Features:
 * - Multi-view SPA Navigation (Home Landing Page, Auth Login/Register, Financial Dashboard)
 * - User Authentication (1-Click Demo Login, Custom Login, Logout)
 * - Dark Mode / Light Mode Theme Engine with persistence
 * - Real-time financial calculations (Balance, Income, Expenses, Savings)
 * - AI Recommendation Engine & 50/30/20 Budget Rule Evaluator
 * - Interactive AI Financial Chat Assistant
 * - Milestone Goal Planner with monthly pace calculators & Confetti celebration
 * - Chart.js Visual Analytics (Cash Flow & Category Breakdown)
 * - Transaction Filtering, Search, and CSV Export
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. Color Palette Tokens & Constants
  // =========================================================================
  const COLORS = {
    blue: '#2563EB',
    green: '#16A34A',
    red: '#DC2626',
    yellow: '#F59E0B',
    ai: '#7C3AED',
    gray: '#94A3B8'
  };

  const STORAGE_KEY = 'smart_expenses_ai_state_v2';
  const THEME_KEY = 'smart_expenses_ai_theme_v2';
  const AUTH_KEY = 'smart_expenses_ai_user_v2';
  const PALETTE_KEY = 'smart_expenses_ai_palette_v2';

  // Demo Dataset for instant exploration
  const DEMO_STATE = {
    currency: '$',
    monthlySalary: {
      amount: 4850.00,
      frequency: 'monthly',
      payDay: '1',
      source: 'Monthly Senior Tech Salary',
      autoSync: true
    },
    transactions: [
      { id: 'tx-1', type: 'income', amount: 4850.00, category: 'Salary & Wages', date: '2026-09-01', note: 'Monthly Senior Tech Salary', method: 'Bank Transfer' },
      { id: 'tx-2', type: 'income', amount: 1200.00, category: 'Freelance & Side Gig', date: '2026-09-05', note: 'Fintech UI Consultation Project', method: 'Bank Transfer' },
      { id: 'tx-3', type: 'income', amount: 165.00, category: 'Investments', date: '2026-09-10', note: 'Index Fund Dividend Distribution', method: 'Digital Wallet' },
      { id: 'tx-4', type: 'expense', amount: 1450.00, category: 'Housing & Rent', date: '2026-09-02', note: 'Apartment Monthly Rent & Building Fee', method: 'Bank Transfer' },
      { id: 'tx-5', type: 'expense', amount: 320.50, category: 'Food & Dining', date: '2026-09-04', note: 'Whole Foods Market Weekly Groceries', method: 'Google Pay (GPay)' },
      { id: 'tx-6', type: 'expense', amount: 185.00, category: 'Food & Dining', date: '2026-09-07', note: 'Omakase Sushi Dinner with Friends', method: 'Credit Card' },
      { id: 'tx-7', type: 'expense', amount: 110.00, category: 'Utilities', date: '2026-09-06', note: 'Fiber Internet & Power Grid Bill', method: 'Bank Transfer' },
      { id: 'tx-8', type: 'expense', amount: 95.00, category: 'Transportation', date: '2026-09-09', note: 'EV Supercharging Station & Metro Passes', method: 'Credit Card' },
      { id: 'tx-9', type: 'expense', amount: 64.99, category: 'Entertainment', date: '2026-09-11', note: 'Netflix Premium, Spotify Family & Cloud Storage', method: 'Credit Card' },
      { id: 'tx-10', type: 'expense', amount: 129.00, category: 'Shopping', date: '2026-09-12', note: 'Ergonomic Desk Accessories & Books', method: 'Google Pay (GPay)' },
      { id: 'tx-11', type: 'expense', amount: 75.00, category: 'Health & Medical', date: '2026-09-14', note: 'Health Supplements & Pharmacy', method: 'Debit Card' },
      { id: 'tx-12', type: 'expense', amount: 500.00, category: 'Savings Deposit', date: '2026-09-03', note: 'High Yield Savings Account Allocation', method: 'Bank Transfer' }
    ],
    goals: [
      { id: 'goal-1', title: 'Emergency Safety Net', target: 6000, current: 4500, deadline: '2026-12-31', icon: '🛡️' },
      { id: 'goal-2', title: 'Japan Autumn Adventure', target: 3500, current: 2450, deadline: '2027-04-15', icon: '✈️' },
      { id: 'goal-3', title: 'Electric Vehicle Down Payment', target: 12000, current: 5200, deadline: '2027-10-31', icon: '🚗' },
      { id: 'goal-4', title: 'Workstation Monitor Setup', target: 1100, current: 1100, deadline: '2026-09-30', icon: '💻' }
    ]
  };

  // =========================================================================
  // 2. Application State & Storage
  // =========================================================================
  let state = {
    currency: '$',
    monthlySalary: {
      amount: 4850.00,
      frequency: 'monthly',
      payDay: '1',
      source: 'Monthly Senior Tech Salary',
      autoSync: true
    },
    transactions: [],
    goals: [],
    filterType: 'all',
    filterSearch: '',
    filterCategory: 'all',
    filterMethod: 'all',
    currentView: 'home',
    currentUser: null,
    theme: 'dark',
    palette: 'cosmic-aurora'
  };

  function loadState() {
    try {
      // Palette & Theme
      const savedPalette = localStorage.getItem(PALETTE_KEY);
      state.palette = savedPalette || 'cosmic-aurora';
      applyPalette(state.palette);

      // User session
      const savedUser = localStorage.getItem(AUTH_KEY);
      if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
      }

      // Financial Data
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        state.currency = parsed.currency || '$';
        state.transactions = parsed.transactions || [];
        state.goals = parsed.goals || [];
        state.monthlySalary = parsed.monthlySalary || null;
      } else {
        // Seed default demo state on fresh launch
        state.currency = DEMO_STATE.currency;
        state.transactions = JSON.parse(JSON.stringify(DEMO_STATE.transactions));
        state.goals = JSON.parse(JSON.stringify(DEMO_STATE.goals));
        state.monthlySalary = JSON.parse(JSON.stringify(DEMO_STATE.monthlySalary));
        saveState();
      }

      // Ensure monthlySalary is properly initialized if older storage exists
      if (!state.monthlySalary) {
        const existingSalaryTx = state.transactions.find(t => t.category === 'Salary & Wages');
        state.monthlySalary = {
          amount: existingSalaryTx ? Number(existingSalaryTx.amount) : 4850.00,
          frequency: 'monthly',
          payDay: '1',
          source: existingSalaryTx ? (existingSalaryTx.note || 'Monthly Senior Tech Salary') : 'Monthly Senior Tech Salary',
          autoSync: true
        };
      }
    } catch (e) {
      console.warn('Failed to parse state from localStorage:', e);
      state.currency = DEMO_STATE.currency;
      state.transactions = JSON.parse(JSON.stringify(DEMO_STATE.transactions));
      state.goals = JSON.parse(JSON.stringify(DEMO_STATE.goals));
      state.monthlySalary = JSON.parse(JSON.stringify(DEMO_STATE.monthlySalary));
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currency: state.currency,
        transactions: state.transactions,
        goals: state.goals,
        monthlySalary: state.monthlySalary
      }));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }

  // =========================================================================
  // 3. Theme & Unique Background Palette Management
  // =========================================================================
  function applyPalette(palette) {
    state.palette = palette;
    document.documentElement.setAttribute('data-palette', palette);
    localStorage.setItem(PALETTE_KEY, palette);

    const select = document.getElementById('paletteSelect');
    if (select) select.value = palette;

    if (palette === 'champagne-pearl') {
      state.theme = 'light';
      document.documentElement.setAttribute('data-theme', 'light');
      const themeIcon = document.getElementById('themeIcon');
      if (themeIcon) themeIcon.textContent = '☀️';
    } else {
      state.theme = 'dark';
      document.documentElement.setAttribute('data-theme', 'dark');
      const themeIcon = document.getElementById('themeIcon');
      if (themeIcon) themeIcon.textContent = '🌙';
    }

    // Re-render charts
    if (cashFlowChartInstance) {
      const isDark = state.theme === 'dark';
      cashFlowChartInstance.options.scales.y.grid.color = isDark ? '#1E293B' : '#F1F5F9';
      cashFlowChartInstance.options.scales.y.ticks.color = isDark ? '#94A3B8' : '#64748B';
      cashFlowChartInstance.options.scales.x.ticks.color = isDark ? '#94A3B8' : '#64748B';
      cashFlowChartInstance.update();
    }
  }

  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    if (theme === 'light') {
      applyPalette('champagne-pearl');
    } else {
      applyPalette('cosmic-aurora');
    }
  }

  function toggleTheme() {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
  }

  // =========================================================================
  // 4. Multi-View SPA Navigation
  // =========================================================================
  function navigateTo(viewName, scrollTarget = null) {
    state.currentView = viewName;

    // View Elements
    const viewHome = document.getElementById('viewHome');
    const viewAuth = document.getElementById('viewAuth');
    const viewDashboard = document.getElementById('viewDashboard');
    const dashNavItems = document.getElementById('dashboardNavItems');

    // Navigation Links
    const navLinkHome = document.getElementById('navLinkHome');
    const navLinkDashboard = document.getElementById('navLinkDashboard');

    // Reset visibility
    viewHome.classList.add('hidden');
    viewAuth.classList.add('hidden');
    viewDashboard.classList.add('hidden');
    dashNavItems.classList.add('hidden');

    navLinkHome.classList.remove('active');
    navLinkDashboard.classList.remove('active');

    if (viewName === 'home') {
      viewHome.classList.remove('hidden');
      navLinkHome.classList.add('active');
      if (scrollTarget) {
        const el = document.getElementById(scrollTarget);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (viewName === 'auth') {
      viewAuth.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewName === 'dashboard') {
      viewDashboard.classList.remove('hidden');
      dashNavItems.classList.remove('hidden');
      navLinkDashboard.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Refresh data & charts
      refreshAllViews();
    }
  }

  // =========================================================================
  // 5. Authentication Engine
  // =========================================================================
  function updateAuthUI() {
    const btnNavLogin = document.getElementById('btnNavLogin');
    const userProfileBadge = document.getElementById('userProfileBadge');
    const navUserName = document.getElementById('navUserName');
    const navUserAvatar = document.getElementById('navUserAvatar');
    const dashUserGreeting = document.getElementById('dashUserGreeting');

    if (state.currentUser) {
      btnNavLogin.classList.add('hidden');
      userProfileBadge.classList.remove('hidden');

      const firstName = state.currentUser.name ? state.currentUser.name.split(' ')[0] : 'User';
      navUserName.textContent = firstName;
      navUserAvatar.textContent = firstName.charAt(0).toUpperCase();
      if (dashUserGreeting) {
        dashUserGreeting.textContent = firstName;
      }
    } else {
      btnNavLogin.classList.remove('hidden');
      userProfileBadge.classList.add('hidden');
      if (dashUserGreeting) {
        dashUserGreeting.textContent = 'Guest';
      }
    }
  }

  function loginUser(name, email) {
    state.currentUser = { name, email };
    localStorage.setItem(AUTH_KEY, JSON.stringify(state.currentUser));
    updateAuthUI();
    showToast(`Welcome back, ${name}! 👋`, 'success');
    navigateTo('dashboard');
  }

  function logoutUser() {
    state.currentUser = null;
    localStorage.removeItem(AUTH_KEY);
    updateAuthUI();
    showToast('Signed out successfully.', 'info');
    navigateTo('home');
  }

  function demoLogin() {
    loginUser('Alex Johnson', 'alex@smartfinance.ai');
  }

  // =========================================================================
  // 6. Formatters & Helpers
  // =========================================================================
  function formatMoney(amount) {
    const num = Number(amount) || 0;
    return `${state.currency}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function formatMoneyNoCents(amount) {
    const num = Number(amount) || 0;
    return `${state.currency}${Math.round(num).toLocaleString('en-US')}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';
    if (type === 'ai') icon = '✨';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // =========================================================================
  // 7. Calculations & KPI Logic
  // =========================================================================
  function computeFinancialSummary() {
    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    state.transactions.forEach(tx => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        totalIncome += amt;
        incomeCount++;
      } else {
        totalExpenses += amt;
        expenseCount++;
      }
    });

    const netCashFlow = totalIncome - totalExpenses;

    let totalGoalSavings = state.goals.reduce((sum, g) => sum + (Number(g.current) || 0), 0);
    let totalGoalTargets = state.goals.reduce((sum, g) => sum + (Number(g.target) || 0), 0);

    const savingsRate = totalIncome > 0 ? Math.max(0, Math.min(100, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100))) : 0;
    const expenseRatio = totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0;
    const goalsOverallProgress = totalGoalTargets > 0 ? Math.min(100, Math.round((totalGoalSavings / totalGoalTargets) * 100)) : 0;

    // AI Health Score Algorithm (0-100)
    let scoreSavings = Math.min(40, Math.round((savingsRate / 25) * 40));
    let scoreExpense = 0;
    if (expenseRatio <= 50) scoreExpense = 35;
    else if (expenseRatio <= 75) scoreExpense = 25;
    else if (expenseRatio <= 90) scoreExpense = 15;
    else if (expenseRatio <= 100) scoreExpense = 5;
    else scoreExpense = 0;

    let scoreGoals = Math.min(25, Math.round((goalsOverallProgress / 100) * 25));
    let aiHealthScore = Math.min(100, Math.max(15, scoreSavings + scoreExpense + scoreGoals));

    let healthStatus = 'Healthy';
    if (aiHealthScore >= 85) healthStatus = 'Superb 🌟';
    else if (aiHealthScore >= 70) healthStatus = 'Healthy 🟢';
    else if (aiHealthScore >= 50) healthStatus = 'Moderate ⚠️';
    else healthStatus = 'At Risk 🔴';

    return {
      totalBalance: netCashFlow,
      totalIncome,
      totalExpenses,
      incomeCount,
      expenseCount,
      savingsRate,
      expenseRatio,
      totalGoalSavings,
      goalsOverallProgress,
      activeGoalsCount: state.goals.filter(g => g.current < g.target).length,
      completedGoalsCount: state.goals.filter(g => g.current >= g.target).length,
      aiHealthScore,
      healthStatus
    };
  }

  // =========================================================================
  // 8. 50/30/20 Rule Analyzer & AI Suggestions
  // =========================================================================
  function compute50_30_20() {
    let needs = 0;
    let wants = 0;
    let savings = 0;

    state.transactions.forEach(tx => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'expense') {
        if (tx.category === 'Housing & Rent' || tx.category === 'Utilities' || tx.category === 'Health & Medical' || tx.category === 'Transportation') {
          needs += amt;
        } else if (tx.category === 'Savings Deposit') {
          savings += amt;
        } else {
          wants += amt;
        }
      }
    });

    const goalFunds = state.goals.reduce((s, g) => s + (Number(g.current) || 0), 0);
    savings += goalFunds;

    const totalTracked = needs + wants + savings;
    if (totalTracked === 0) {
      return { needsPct: 50, wantsPct: 30, savingsPct: 20, needs, wants, savings };
    }

    const needsPct = Math.round((needs / totalTracked) * 100);
    const wantsPct = Math.round((wants / totalTracked) * 100);
    const savingsPct = Math.max(0, 100 - needsPct - wantsPct);

    return { needsPct, wantsPct, savingsPct, needs, wants, savings };
  }

  function generateAISuggestions() {
    const summary = computeFinancialSummary();
    const rule = compute50_30_20();
    const suggestions = [];

    const categoryTotals = {};
    state.transactions.filter(t => t.type === 'expense').forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });

    const foodDining = categoryTotals['Food & Dining'] || 0;
    const entertainment = categoryTotals['Entertainment'] || 0;

    if (foodDining > 350 || (summary.totalIncome > 0 && (foodDining / summary.totalIncome) > 0.15)) {
      const potentialSave = Math.round(foodDining * 0.25);
      suggestions.push({
        id: 'sugg-dining',
        icon: '🍔',
        title: 'Optimize Dining & Takeout Expenses',
        impact: 'high',
        savings: `Save ~${formatMoneyNoCents(potentialSave)}/mo`,
        desc: `You spent ${formatMoney(foodDining)} on dining. Cooking 2 more meals at home per week will easily free up ${formatMoneyNoCents(potentialSave)}/month towards your goals.`
      });
    }

    if (entertainment > 60) {
      suggestions.push({
        id: 'sugg-subs',
        icon: '🎬',
        title: 'Subscription & Digital Media Audit',
        impact: 'normal',
        savings: 'Save ~$30/mo',
        desc: `You have recurring entertainment charges totaling ${formatMoney(entertainment)}. Audit unused streaming or gym apps to save money without sacrificing fun.`
      });
    }

    if (rule.wantsPct > 35) {
      suggestions.push({
        id: 'sugg-wants',
        icon: '⚖️',
        title: 'Discretionary Wants Exceed 30% Guideline',
        impact: 'warning',
        savings: 'Boost Savings by 8%',
        desc: `Discretionary 'Wants' account for ${rule.wantsPct}% of your spend (target ≤ 30%). Trimming leisure will supercharge your goal timeline.`
      });
    }

    const activeGoals = state.goals.filter(g => g.current < g.target);
    if (activeGoals.length > 0) {
      const nearestGoal = activeGoals[0];
      const remaining = nearestGoal.target - nearestGoal.current;
      suggestions.push({
        id: 'sugg-goal',
        icon: '🎯',
        title: `Accelerate: ${nearestGoal.title}`,
        impact: 'high',
        savings: `Reach 1 month faster`,
        desc: `You have ${formatMoney(remaining)} left on '${nearestGoal.title}'. An extra ${formatMoneyNoCents(75)} weekly transfer finishes this milestone ahead of schedule!`
      });
    }

    return suggestions;
  }

  // =========================================================================
  // 9. UI Renderers
  // =========================================================================
  function renderKPIs() {
    const summary = computeFinancialSummary();

    const elBalance = document.getElementById('kpiBalance');
    elBalance.textContent = formatMoney(summary.totalBalance);
    if (summary.totalBalance < 0) {
      elBalance.classList.add('color-red');
    } else {
      elBalance.classList.remove('color-red');
    }

    const deltaEl = document.getElementById('kpiCashFlowDelta');
    if (summary.totalBalance >= 0) {
      deltaEl.textContent = `Cash Flow: +${formatMoney(summary.totalBalance)}`;
      deltaEl.className = 'badge-green';
    } else {
      deltaEl.textContent = `Cash Flow: -${formatMoney(Math.abs(summary.totalBalance))}`;
      deltaEl.className = 'badge-red';
    }

    document.getElementById('kpiIncome').textContent = formatMoney(summary.totalIncome);
    document.getElementById('kpiIncomeCount').textContent = `${summary.incomeCount} incoming entries`;

    document.getElementById('kpiExpenses').textContent = formatMoney(summary.totalExpenses);
    document.getElementById('kpiSpendRatio').textContent = `${summary.expenseRatio}% of income spent`;

    document.getElementById('kpiSavings').textContent = formatMoney(summary.totalGoalSavings);
    document.getElementById('kpiSavingsRate').textContent = `${summary.savingsRate}% savings rate`;

    document.getElementById('kpiGoalsProgress').textContent = `${summary.goalsOverallProgress}%`;
    document.getElementById('kpiGoalsCount').textContent = `${summary.activeGoalsCount} active, ${summary.completedGoalsCount} done`;

    document.getElementById('healthScoreVal').textContent = `${summary.aiHealthScore}/100`;
    document.getElementById('healthScoreBadge').textContent = summary.healthStatus;

    // Monthly Salary live badges
    if (state.monthlySalary) {
      const dashSalaryBadge = document.getElementById('dashSalaryBadge');
      if (dashSalaryBadge) {
        dashSalaryBadge.textContent = `${formatMoney(state.monthlySalary.amount)}/mo`;
      }
      const kpiBaseSalaryVal = document.getElementById('kpiBaseSalaryVal');
      if (kpiBaseSalaryVal) {
        kpiBaseSalaryVal.textContent = formatMoney(state.monthlySalary.amount);
      }
    }
  }

  function renderAISuggestions() {
    const container = document.getElementById('aiSuggestionsList');
    const countBadge = document.getElementById('aiSuggestionCount');
    const suggestions = generateAISuggestions();

    countBadge.textContent = `${suggestions.length} Active Tips`;

    if (suggestions.length === 0) {
      container.innerHTML = `
        <div class="ai-suggestion-card">
          <div class="ai-sugg-icon">🌟</div>
          <div class="ai-sugg-content">
            <div class="ai-sugg-head"><span class="ai-sugg-title">Finances Looking Stellar!</span></div>
            <p class="ai-sugg-desc">Your budget distribution, savings rate, and goal progress are fully aligned with financial health standards.</p>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = suggestions.map(s => {
      let impactClass = '';
      if (s.impact === 'high') impactClass = 'high-impact';
      if (s.impact === 'warning') impactClass = 'warning-impact';

      return `
        <div class="ai-suggestion-card ${impactClass}">
          <div class="ai-sugg-icon">${s.icon}</div>
          <div class="ai-sugg-content">
            <div class="ai-sugg-head">
              <span class="ai-sugg-title">${s.title}</span>
              <span class="ai-sugg-savings">${s.savings}</span>
            </div>
            <p class="ai-sugg-desc">${s.desc}</p>
          </div>
        </div>
      `;
    }).join('');

    // 50/30/20 Rule Bar
    const rule = compute50_30_20();
    const barNeeds = document.getElementById('barNeeds');
    const barWants = document.getElementById('barWants');
    const barSavings = document.getElementById('barSavings');

    barNeeds.style.width = `${Math.max(12, rule.needsPct)}%`;
    barNeeds.textContent = `${rule.needsPct}% Needs`;

    barWants.style.width = `${Math.max(12, rule.wantsPct)}%`;
    barWants.textContent = `${rule.wantsPct}% Wants`;

    barSavings.style.width = `${Math.max(12, rule.savingsPct)}%`;
    barSavings.textContent = `${rule.savingsPct}% Savings`;

    document.getElementById('valNeeds').textContent = `${rule.needsPct}%`;
    document.getElementById('valWants').textContent = `${rule.wantsPct}%`;
    document.getElementById('valSavings').textContent = `${rule.savingsPct}%`;
  }

  function renderGoals() {
    const grid = document.getElementById('goalsGrid');
    if (!grid) return;

    if (state.goals.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1; background:var(--color-surface); border-radius:16px;">
          <div class="empty-icon">🎯</div>
          <h4>No financial goals set yet</h4>
          <p>Click "Create New Goal" to start planning for emergency funds, travel, or major purchases.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = state.goals.map(goal => {
      const target = Number(goal.target) || 1;
      const current = Number(goal.current) || 0;
      const pct = Math.min(100, Math.round((current / target) * 100));
      const isCompleted = current >= target;
      const remaining = Math.max(0, target - current);

      let monthsRemaining = 1;
      if (goal.deadline) {
        const today = new Date();
        const deadlineDate = new Date(goal.deadline);
        const diffYears = deadlineDate.getFullYear() - today.getFullYear();
        const diffMonths = (diffYears * 12) + (deadlineDate.getMonth() - today.getMonth());
        monthsRemaining = Math.max(1, diffMonths);
      }
      const monthlyPace = remaining > 0 ? (remaining / monthsRemaining) : 0;

      return `
        <div class="goal-card ${isCompleted ? 'completed' : ''}" data-goal-id="${goal.id}">
          <div class="goal-card-top">
            <div class="goal-icon-title">
              <div class="goal-icon-badge">${goal.icon || '🎯'}</div>
              <div class="goal-titles">
                <h4>${escapeHTML(goal.title)}</h4>
                <span class="goal-deadline-tag">Target: ${formatDate(goal.deadline)}</span>
              </div>
            </div>
            <span class="goal-status-badge ${isCompleted ? 'badge-green' : 'badge-yellow'}">
              ${isCompleted ? '🎉 Goal Met' : `${pct}% Done`}
            </span>
          </div>

          <div class="goal-numbers">
            <span class="goal-current-amount">${formatMoney(current)}</span>
            <span class="goal-target-amount">of ${formatMoney(target)}</span>
          </div>

          <div class="goal-progress-wrap">
            <div class="goal-progress-fill" style="width: ${pct}%;"></div>
          </div>

          <div class="goal-meta-grid">
            <div class="goal-meta-item">
              <span>Remaining</span>
              <strong>${formatMoney(remaining)}</strong>
            </div>
            <div class="goal-meta-item">
              <span>Monthly Pace</span>
              <strong>${isCompleted ? '$0.00' : formatMoney(monthlyPace) + '/mo'}</strong>
            </div>
          </div>

          <div class="goal-card-actions">
            <button class="btn btn-secondary btn-sm btn-view-goal-details" data-id="${goal.id}" title="Inspect goal timeline">
              Details 🔍
            </button>
            <button class="btn btn-yellow btn-sm btn-contribute-goal" data-id="${goal.id}" ${isCompleted ? 'disabled' : ''}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Deposit
            </button>
            <button class="btn btn-secondary btn-sm btn-delete-goal" data-id="${goal.id}" title="Delete goal">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Event Listeners
    grid.querySelectorAll('.btn-view-goal-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        openGoalDetailsModal(id);
      });
    });

    grid.querySelectorAll('.goal-card-top').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', (e) => {
        const card = e.currentTarget.closest('.goal-card');
        if (card && card.dataset.goalId) {
          openGoalDetailsModal(card.dataset.goalId);
        }
      });
    });

    grid.querySelectorAll('.btn-contribute-goal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        openContributeModal(id);
      });
    });

    grid.querySelectorAll('.btn-delete-goal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        deleteGoal(id);
      });
    });
  }

  function renderTransactions() {
    const tbody = document.getElementById('txTableBody');
    const emptyState = document.getElementById('txEmptyState');
    if (!tbody) return;

    let filtered = state.transactions.slice();

    if (state.filterType !== 'all') {
      filtered = filtered.filter(t => t.type === state.filterType);
    }

    if (state.filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === state.filterCategory);
    }

    if (state.filterMethod && state.filterMethod !== 'all') {
      filtered = filtered.filter(t => {
        if (state.filterMethod === 'Google Pay (GPay)') {
          return isGPay(t.method);
        }
        return t.method === state.filterMethod;
      });
    }

    if (state.filterSearch.trim()) {
      const q = state.filterSearch.toLowerCase();
      filtered = filtered.filter(t => 
        (t.note && t.note.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.method && t.method.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    tbody.innerHTML = filtered.map(tx => {
      const isIncome = tx.type === 'income';
      const amtClass = isIncome ? 'amount-income' : 'amount-expense';
      const sign = isIncome ? '+' : '-';

      return `
        <tr data-tx-id="${tx.id}" class="clickable-tx-row" title="Click to view full details">
          <td style="white-space: nowrap; color: var(--color-text-muted); font-size: 0.8rem;">
            ${formatDate(tx.date)}
          </td>
          <td>
            <div class="tx-desc">${escapeHTML(tx.note || 'Untitled Transaction')}</div>
          </td>
          <td>
            <span class="category-pill">${getCategoryIcon(tx.category)} ${escapeHTML(tx.category)}</span>
          </td>
          <td>
            <span class="method-tag ${isGPay(tx.method) ? 'method-gpay' : ''}">
              ${getMethodIcon(tx.method)} ${escapeHTML(tx.method || 'Card')}
            </span>
          </td>
          <td class="text-right">
            <span class="tx-amount ${amtClass}">${sign}${formatMoney(tx.amount)}</span>
          </td>
          <td class="text-center">
            <div class="action-btn-group">
              <button class="btn-details-view btn-inspect-tx" data-id="${tx.id}" title="Inspect details">
                Details 🔍
              </button>
              <button class="btn-icon-action delete-action btn-delete-tx" data-id="${tx.id}" title="Delete transaction">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach inspect & delete listeners
    tbody.querySelectorAll('.btn-inspect-tx').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        openTxDetailsModal(id);
      });
    });

    tbody.querySelectorAll('.clickable-tx-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.delete-action')) return;
        const id = row.dataset.txId;
        openTxDetailsModal(id);
      });
    });

    tbody.querySelectorAll('.btn-delete-tx').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        deleteTransaction(id);
      });
    });
  }

  function getCategoryIcon(category) {
    switch (category) {
      case 'Food & Dining': return '🍔';
      case 'Housing & Rent': return '🏠';
      case 'Utilities': return '⚡';
      case 'Transportation': return '🚗';
      case 'Entertainment': return '🎬';
      case 'Health & Medical': return '🏥';
      case 'Shopping': return '🛍️';
      case 'Salary & Wages': return '💼';
      case 'Freelance & Side Gig': return '💻';
      case 'Investments': return '📈';
      case 'Savings Deposit': return '💰';
      default: return '📦';
    }
  }

  function isGPay(method) {
    if (!method) return false;
    const m = String(method).toLowerCase();
    return m.includes('gpay') || m.includes('google pay');
  }

  function getMethodIcon(method) {
    if (!method) return '💳';
    const m = String(method).toLowerCase();
    if (m.includes('gpay') || m.includes('google pay')) return '📱';
    if (m.includes('apple')) return '🍎';
    if (m.includes('cash')) return '💵';
    if (m.includes('bank') || m.includes('transfer')) return '🏦';
    if (m.includes('debit')) return '💳';
    if (m.includes('credit')) return '💳';
    if (m.includes('wallet') || m.includes('upi')) return '📲';
    return '💳';
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // =========================================================================
  // 10. Interactive Charts (Chart.js)
  // =========================================================================
  let cashFlowChartInstance = null;
  let categoryDonutChartInstance = null;

  function initOrUpdateCharts() {
    if (typeof Chart === 'undefined') return;
    const isDark = state.theme === 'dark';

    // Chart 1: Cash Flow Breakdown
    const ctxCashFlow = document.getElementById('cashFlowChart');
    if (ctxCashFlow) {
      const summary = computeFinancialSummary();
      const incomeVal = summary.totalIncome;
      const expenseVal = summary.totalExpenses;
      const savingsVal = Math.max(0, incomeVal - expenseVal);

      const chartData = {
        labels: ['Income (Green)', 'Expenses (Red)', 'Net Savings (Blue)'],
        datasets: [{
          label: 'Current Amount',
          data: [incomeVal, expenseVal, savingsVal],
          backgroundColor: [
            COLORS.green,
            COLORS.red,
            COLORS.blue
          ],
          borderRadius: 8,
          borderSkipped: false
        }]
      };

      if (cashFlowChartInstance) {
        cashFlowChartInstance.data = chartData;
        cashFlowChartInstance.options.scales.y.grid.color = isDark ? '#1E293B' : '#F1F5F9';
        cashFlowChartInstance.options.scales.y.ticks.color = isDark ? '#94A3B8' : '#64748B';
        cashFlowChartInstance.options.scales.x.ticks.color = isDark ? '#94A3B8' : '#64748B';
        cashFlowChartInstance.update();
      } else {
        cashFlowChartInstance = new Chart(ctxCashFlow, {
          type: 'bar',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context) => ` ${state.currency}${context.parsed.y.toLocaleString()}`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  color: isDark ? '#94A3B8' : '#64748B',
                  callback: (val) => `${state.currency}${val}`
                },
                grid: { color: isDark ? '#1E293B' : '#F1F5F9' }
              },
              x: {
                ticks: { color: isDark ? '#94A3B8' : '#64748B' },
                grid: { display: false }
              }
            }
          }
        });
      }
    }

    // Chart 2: Category Donut Chart
    const ctxDonut = document.getElementById('categoryDonutChart');
    if (ctxDonut) {
      const categoryTotals = {};
      state.transactions.filter(t => t.type === 'expense').forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
      });

      const labels = Object.keys(categoryTotals);
      const data = Object.values(categoryTotals);

      const donutPalette = [
        '#DC2626', '#2563EB', '#F59E0B', '#16A34A', '#7C3AED',
        '#EC4899', '#06B6D4', '#8B5CF6', '#F97316', '#64748B'
      ];

      const donutData = {
        labels: labels.length > 0 ? labels : ['No Expense Data'],
        datasets: [{
          data: data.length > 0 ? data : [1],
          backgroundColor: data.length > 0 ? donutPalette.slice(0, labels.length) : ['#334155'],
          borderWidth: 2,
          borderColor: isDark ? '#121A2D' : '#FFFFFF'
        }]
      };

      if (categoryDonutChartInstance) {
        categoryDonutChartInstance.data = donutData;
        categoryDonutChartInstance.options.plugins.legend.labels.color = isDark ? '#F1F5F9' : '#475569';
        categoryDonutChartInstance.update();
      } else {
        categoryDonutChartInstance = new Chart(ctxDonut, {
          type: 'doughnut',
          data: donutData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  boxWidth: 12,
                  font: { family: 'Inter', size: 11 },
                  color: isDark ? '#F1F5F9' : '#475569'
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const val = context.parsed;
                    return ` ${context.label}: ${state.currency}${Number(val).toLocaleString()}`;
                  }
                }
              }
            }
          }
        });
      }
    }
  }

  // =========================================================================
  // 11. AI Chatbot Assistant Engine
  // =========================================================================
  function initAIChat() {
    const form = document.getElementById('aiChatForm');
    const input = document.getElementById('aiChatInput');
    const messagesContainer = document.getElementById('aiChatMessages');
    const chips = document.querySelectorAll('.ai-prompt-chips .chip');

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.dataset.query;
        if (query) {
          handleUserChatMessage(query);
        }
      });
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        handleUserChatMessage(text);
      });
    }

    function appendMessage(sender, htmlText) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-msg ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
      msgDiv.innerHTML = htmlText;
      messagesContainer.appendChild(msgDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function handleUserChatMessage(query) {
      appendMessage('user', `<p>${escapeHTML(query)}</p>`);

      const typingDiv = document.createElement('div');
      typingDiv.className = 'chat-msg bot-msg';
      typingDiv.id = 'aiTypingIndicator';
      typingDiv.innerHTML = '<em>Thinking with financial heuristics... 🧠</em>';
      messagesContainer.appendChild(typingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      setTimeout(() => {
        const ind = document.getElementById('aiTypingIndicator');
        if (ind) ind.remove();

        const responseHTML = generateAIResponse(query);
        appendMessage('bot', responseHTML);
      }, 500);
    }

    function generateAIResponse(q) {
      const query = q.toLowerCase();
      const summary = computeFinancialSummary();
      const rule = compute50_30_20();

      const categoryTotals = {};
      state.transactions.filter(t => t.type === 'expense').forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
      });

      if (query.includes('salary') || query.includes('wage') || query.includes('paycheck') || query.includes('earn')) {
        const salary = state.monthlySalary ? state.monthlySalary.amount : 4850;
        const freq = state.monthlySalary ? state.monthlySalary.frequency : 'monthly';
        const annual = salary * 12;
        const needs = salary * 0.50;
        const wants = salary * 0.30;
        const savings = salary * 0.20;

        return `
          <p>💼 <strong>Configured Base Salary &amp; Budget Allocation:</strong></p>
          <p>Your recurring salary is currently set to <strong>${formatMoney(salary)}/month</strong> (~${formatMoneyNoCents(annual)}/year, paid ${freq}).</p>
          <div style="margin-top:0.6rem; padding:0.65rem 0.85rem; background:rgba(255,255,255,0.06); border-radius:8px; font-size:0.82rem; line-height:1.6;">
            <strong>50/30/20 Ideal Targets Calibrated to Your Salary:</strong><br>
            • <strong>Needs (50%):</strong> ${formatMoney(needs)} max (Housing, Utilities, Groceries)<br>
            • <strong>Wants (30%):</strong> ${formatMoney(wants)} max (Dining, Shopping, Fun)<br>
            • <strong>Savings &amp; Goals (20%):</strong> ${formatMoney(savings)} min towards your goals
          </div>
          <p style="margin-top:0.5rem; font-size:0.8rem; color:var(--color-text-muted);">Click <strong>Monthly Salary</strong> on the dashboard banner or on the Monthly Income card to update your salary at any time.</p>
        `;
      }

      if (query.includes('gpay') || query.includes('google pay')) {
        const gpayTxs = state.transactions.filter(t => isGPay(t.method));
        const totalGPay = gpayTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
        return `
          <p>📱 <strong>Google Pay (GPay) Financial Summary:</strong></p>
          <p>You have logged <strong>${gpayTxs.length} transaction(s)</strong> paid via Google Pay (GPay), totaling <strong>${formatMoney(totalGPay)}</strong>.</p>
          ${gpayTxs.length > 0 ? `
            <ul style="margin: 0.5rem 0 0 1.2rem; line-height: 1.5;">
              ${gpayTxs.slice(0, 4).map(t => `<li><strong>${formatDate(t.date)}:</strong> ${escapeHTML(t.note)} &mdash; <span class="${t.type === 'income' ? 'color-green' : 'color-red'}">${t.type === 'income' ? '+' : '-'}${formatMoney(t.amount)}</span> (${t.category})</li>`).join('')}
            </ul>
          ` : '<p style="margin-top:0.3rem; color:var(--color-text-muted);">No transactions currently logged under Google Pay. You can select GPay when adding or editing any transaction.</p>'}
        `;
      }

      if (query.includes('200') || query.includes('save') && query.includes('more')) {
        const dining = categoryTotals['Food & Dining'] || 0;
        return `
          <p>💡 <strong>AI 3-Step Strategy to Save $200+ this Month:</strong></p>
          <ul style="margin: 0.5rem 0 0 1.2rem; line-height: 1.5;">
            <li><strong>Dining & Takeout:</strong> You spent ${formatMoney(dining)}. Reducing dining out by 2 outings saves <strong>~$110</strong>.</li>
            <li><strong>Discretionary Shopping:</strong> Apply the <em>48-hour pause rule</em> before impulse purchases to free up <strong>~$60</strong>.</li>
            <li><strong>Automate Payday Transfer:</strong> Route $30/week directly into savings on payday before discretionary spending begins.</li>
          </ul>
        `;
      }

      if (query.includes('analyze') || query.includes('budget') || query.includes('spending habits')) {
        return `
          <p>📊 <strong>Ledger Health Analysis:</strong></p>
          <ul style="margin: 0.5rem 0 0 1.2rem; line-height: 1.5;">
            <li><strong>Income:</strong> ${formatMoney(summary.totalIncome)} across ${summary.incomeCount} sources.</li>
            <li><strong>Burn Rate:</strong> Spending ${formatMoney(summary.totalExpenses)} (${summary.expenseRatio}% of total revenue).</li>
            <li><strong>50/30/20 Breakdown:</strong> Needs: ${rule.needsPct}% | Wants: ${rule.wantsPct}% | Savings: ${rule.savingsPct}%.</li>
            <li><strong>Health Score:</strong> Rated <strong>${summary.aiHealthScore}/100 (${summary.healthStatus})</strong>.</li>
          </ul>
        `;
      }

      if (query.includes('goal') || query.includes('track') || query.includes('feasibility')) {
        const active = state.goals.filter(g => g.current < g.target);
        if (active.length === 0) {
          return `<p>🎯 All your current goals are fully funded! Create a new financial goal to keep building wealth.</p>`;
        }
        const gList = active.map(g => {
          const rem = g.target - g.current;
          const pct = Math.round((g.current / g.target) * 100);
          return `<li><strong>${g.title}:</strong> ${pct}% funded (${formatMoney(rem)} remaining until ${formatDate(g.deadline)}).</li>`;
        }).join('');

        return `
          <p>🎯 <strong>Goal Feasibility Report:</strong></p>
          <ul style="margin: 0.5rem 0 0 1.2rem; line-height: 1.5;">${gList}</ul>
          <p style="margin-top: 0.4rem;">You have positive liquid cash flow to comfortably stay on track!</p>
        `;
      }

      if (query.includes('overspending') || query.includes('leak') || query.includes('where')) {
        const highestCat = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
        if (!highestCat) {
          return `<p>No expense data recorded yet to detect overspending.</p>`;
        }
        return `
          <p>🚨 <strong>Top Spending Concentration:</strong></p>
          <p>Your highest outgoing category is <strong>${highestCat[0]}</strong> at <strong>${formatMoney(highestCat[1])}</strong>.</p>
          <p>Trimming 15% from this category reclaims <strong>${formatMoney(highestCat[1] * 0.15)}</strong> per month straight into your savings goals!</p>
        `;
      }

      return `
        <p>I analyzed your current state: Total Liquid Cash is <strong>${formatMoney(summary.totalBalance)}</strong> with a <strong>${summary.savingsRate}%</strong> savings rate. Ask me specific questions like: <em>"Where am I overspending?"</em> or <em>"How can I save $200 more?"</em></p>
      `;
    }
  }

  // =========================================================================
  // 12. Transaction CRUD & Modals
  // =========================================================================
  function openTxModal(editId = null) {
    const modal = document.getElementById('txModal');
    const form = document.getElementById('txForm');
    form.reset();

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('txDate').value = today;
    document.getElementById('txId').value = '';
    document.getElementById('txModalTitle').textContent = 'Add New Transaction';

    setTxType('expense');

    if (editId) {
      const tx = state.transactions.find(t => t.id === editId);
      if (tx) {
        document.getElementById('txId').value = tx.id;
        document.getElementById('txAmount').value = tx.amount;
        document.getElementById('txDate').value = tx.date;
        document.getElementById('txCategory').value = tx.category;
        const methodSelect = document.getElementById('txMethod');
        if (methodSelect) {
          if (isGPay(tx.method)) {
            methodSelect.value = 'Google Pay (GPay)';
          } else {
            methodSelect.value = tx.method || 'Google Pay (GPay)';
          }
        }
        document.getElementById('txNote').value = tx.note;
        document.getElementById('txModalTitle').textContent = 'Edit Transaction';
        setTxType(tx.type);
      }
    }

    modal.classList.remove('hidden');
    document.getElementById('txAmount').focus();
  }

  function closeTxModal() {
    document.getElementById('txModal').classList.add('hidden');
  }

  function setTxType(type) {
    const labelExpense = document.getElementById('labelTypeExpense');
    const labelIncome = document.getElementById('labelTypeIncome');
    const radioExpense = labelExpense.querySelector('input');
    const radioIncome = labelIncome.querySelector('input');

    if (type === 'income') {
      radioIncome.checked = true;
      labelIncome.className = 'type-toggle-label active-income';
      labelExpense.className = 'type-toggle-label';
      const catSelect = document.getElementById('txCategory');
      if (catSelect && (catSelect.value === 'Food & Dining' || catSelect.value === 'Housing & Rent')) {
        catSelect.value = 'Salary & Wages';
      }
      const amountInput = document.getElementById('txAmount');
      if (amountInput && (!amountInput.value || amountInput.value === '0') && state.monthlySalary) {
        amountInput.value = state.monthlySalary.amount;
      }
    } else {
      radioExpense.checked = true;
      labelExpense.className = 'type-toggle-label active-expense';
      labelIncome.className = 'type-toggle-label';
    }
  }

  function handleSaveTransaction(e) {
    e.preventDefault();
    const id = document.getElementById('txId').value;
    const amount = parseFloat(document.getElementById('txAmount').value);
    const date = document.getElementById('txDate').value;
    const category = document.getElementById('txCategory').value;
    const method = document.getElementById('txMethod').value;
    const note = document.getElementById('txNote').value.trim();
    const type = document.querySelector('input[name="txType"]:checked').value;

    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount greater than zero', 'error');
      return;
    }

    if (!note) {
      showToast('Please provide a description or merchant', 'error');
      return;
    }

    if (id) {
      const index = state.transactions.findIndex(t => t.id === id);
      if (index !== -1) {
        state.transactions[index] = { id, type, amount, date, category, method, note };
        showToast('Transaction updated successfully', 'success');
      }
    } else {
      const newTx = {
        id: 'tx-' + Date.now(),
        type,
        amount,
        date,
        category,
        method,
        note
      };
      state.transactions.unshift(newTx);
      showToast(`${type === 'income' ? 'Income' : 'Expense'} recorded: ${formatMoney(amount)}`, 'success');
    }

    saveState();
    refreshAllViews();
    closeTxModal();
  }

  function deleteTransaction(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    state.transactions = state.transactions.filter(t => t.id !== id);
    saveState();
    refreshAllViews();
    showToast(`Removed transaction '${tx.note}'`, 'info');
  }

  // =========================================================================
  // 13. Financial Goal Planner CRUD & Contributions
  // =========================================================================
  function openGoalModal() {
    const modal = document.getElementById('goalModal');
    const form = document.getElementById('goalForm');
    form.reset();

    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    document.getElementById('goalDeadline').value = d.toISOString().split('T')[0];

    modal.classList.remove('hidden');
    document.getElementById('goalTitle').focus();
  }

  function closeGoalModal() {
    document.getElementById('goalModal').classList.add('hidden');
  }

  function handleSaveGoal(e) {
    e.preventDefault();
    const title = document.getElementById('goalTitle').value.trim();
    const target = parseFloat(document.getElementById('goalTarget').value);
    const current = parseFloat(document.getElementById('goalCurrent').value) || 0;
    const deadline = document.getElementById('goalDeadline').value;
    const icon = document.getElementById('goalIcon').value;

    if (!title || isNaN(target) || target <= 0) {
      showToast('Please specify a goal name and valid target amount', 'error');
      return;
    }

    const newGoal = {
      id: 'goal-' + Date.now(),
      title,
      target,
      current,
      deadline,
      icon
    };

    state.goals.push(newGoal);
    saveState();
    refreshAllViews();
    closeGoalModal();
    showToast(`New Financial Goal created: '${title}'! 🎯`, 'success');
  }

  function deleteGoal(id) {
    const goal = state.goals.find(g => g.id === id);
    if (!goal) return;

    if (confirm(`Are you sure you want to delete the goal '${goal.title}'?`)) {
      state.goals = state.goals.filter(g => g.id !== id);
      saveState();
      refreshAllViews();
      showToast(`Goal '${goal.title}' deleted`, 'info');
    }
  }

  function openContributeModal(goalId) {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;

    const modal = document.getElementById('contributeModal');
    document.getElementById('contributeGoalId').value = goal.id;
    document.getElementById('contributeGoalName').textContent = `Target: ${goal.title} (${formatMoney(goal.current)} of ${formatMoney(goal.target)})`;
    document.getElementById('contributeAmount').value = '';
    modal.classList.remove('hidden');
    document.getElementById('contributeAmount').focus();
  }

  function closeContributeModal() {
    document.getElementById('contributeModal').classList.add('hidden');
  }

  function handleSaveContribution(e) {
    e.preventDefault();
    const goalId = document.getElementById('contributeGoalId').value;
    const amount = parseFloat(document.getElementById('contributeAmount').value);
    const logExpense = document.getElementById('contributeLogExpense').checked;

    const goal = state.goals.find(g => g.id === goalId);
    if (!goal || isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid deposit amount', 'error');
      return;
    }

    goal.current += amount;
    const justCompleted = goal.current >= goal.target;

    const contributeMethodEl = document.getElementById('contributeMethod');
    const depositMethod = contributeMethodEl ? contributeMethodEl.value : 'Google Pay (GPay)';

    if (logExpense) {
      state.transactions.unshift({
        id: 'tx-' + Date.now(),
        type: 'expense',
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        category: 'Savings Deposit',
        method: depositMethod,
        note: `Goal Deposit: ${goal.title}`
      });
    }

    saveState();
    refreshAllViews();
    closeContributeModal();

    if (justCompleted && typeof confetti === 'function') {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast(`🎉 CONGRATULATIONS! You have reached 100% of '${goal.title}'!`, 'success');
    } else {
      showToast(`Deposited ${formatMoney(amount)} into '${goal.title}'! 💰`, 'success');
    }
  }

  // =========================================================================
  // 14. CSV Export & Demo Reset
  // =========================================================================
  function exportCSV() {
    if (state.transactions.length === 0) {
      showToast('No transactions to export', 'info');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,Date,Type,Category,Description,Amount,Payment Method\n';
    state.transactions.forEach(t => {
      const row = [
        `"${t.date}"`,
        `"${t.type}"`,
        `"${t.category}"`,
        `"${(t.note || '').replace(/"/g, '""')}"`,
        `"${t.amount}"`,
        `"${t.method || ''}"`
      ].join(',');
      csvContent += row + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported transactions to CSV successfully', 'success');
  }

  function loadDemoData() {
    state.currency = DEMO_STATE.currency;
    state.transactions = JSON.parse(JSON.stringify(DEMO_STATE.transactions));
    state.goals = JSON.parse(JSON.stringify(DEMO_STATE.goals));
    state.monthlySalary = JSON.parse(JSON.stringify(DEMO_STATE.monthlySalary));
    saveState();
    refreshAllViews();
    showToast('Reset to rich demo dataset with goals and ledger!', 'ai');
  }

  function resetAllData() {
    if (confirm('Are you sure you want to reset all data? This will clear all transactions and goals.')) {
      state.transactions = [];
      state.goals = [];
      saveState();
      refreshAllViews();
      showToast('All transaction and goal data has been reset', 'info');
    }
  }

  // =========================================================================
  // 14B. Details Inspection Engines (Transactions, KPIs, Goals)
  // =========================================================================
  let currentViewingTxId = null;

  function openTxDetailsModal(txId) {
    const tx = state.transactions.find(t => t.id === txId);
    if (!tx) return;

    currentViewingTxId = txId;
    const isIncome = tx.type === 'income';
    const summary = computeFinancialSummary();
    const baseTotal = isIncome ? summary.totalIncome : summary.totalExpenses;
    const pct = baseTotal > 0 ? Math.round((tx.amount / baseTotal) * 100) : 0;

    const modal = document.getElementById('txDetailsModal');
    const dtlTxTypeBadge = document.getElementById('dtlTxTypeBadge');
    dtlTxTypeBadge.textContent = isIncome ? 'Income Inflow' : 'Expense Outflow';
    dtlTxTypeBadge.className = isIncome ? 'badge-green' : 'badge-red';

    document.getElementById('dtlTxCategoryPill').textContent = `${getCategoryIcon(tx.category)} ${tx.category}`;
    const elAmount = document.getElementById('dtlTxAmount');
    elAmount.textContent = `${isIncome ? '+' : '-'}${formatMoney(tx.amount)}`;
    elAmount.className = `details-amount ${isIncome ? 'color-green' : 'color-red'}`;

    document.getElementById('dtlTxTitle').textContent = tx.note || 'Untitled Transaction';
    document.getElementById('dtlTxDate').textContent = formatDate(tx.date);
    document.getElementById('dtlTxMethod').innerHTML = `${getMethodIcon(tx.method)} ${escapeHTML(tx.method || 'Credit Card')}`;
    document.getElementById('dtlTxImpact').textContent = `${pct}% of this month's total ${isIncome ? 'income' : 'expenses'}`;

    modal.classList.remove('hidden');
  }

  function closeTxDetailsModal() {
    const modal = document.getElementById('txDetailsModal');
    if (modal) modal.classList.add('hidden');
    currentViewingTxId = null;
  }

  function openKpiDetailsModal(kpiType) {
    const summary = computeFinancialSummary();
    const rule = compute50_30_20();
    const modal = document.getElementById('kpiDetailsModal');
    const titleEl = document.getElementById('kpiDetailsModalTitle');
    const bodyEl = document.getElementById('kpiDetailsBody');

    let contentHTML = '';

    if (kpiType === 'balance') {
      titleEl.textContent = 'Liquid Cash Flow & Runway Details';
      const monthlyBurn = summary.totalExpenses > 0 ? summary.totalExpenses : 1;
      const runwayMonths = (summary.totalGoalSavings / monthlyBurn).toFixed(1);

      contentHTML = `
        <div class="details-hero">
          <div class="details-badge-row"><span class="badge-neutral">Formula: Inflow - Outflow</span></div>
          <div class="details-amount ${summary.totalBalance >= 0 ? 'color-green' : 'color-red'}">${formatMoney(summary.totalBalance)}</div>
          <div class="details-title">Current Liquid Funds</div>
        </div>
        <div class="details-list">
          <div class="details-item">
            <span class="details-item-label">💵 Gross Inflows (Income)</span>
            <span class="details-item-value color-green">+${formatMoney(summary.totalIncome)}</span>
          </div>
          <div class="details-item">
            <span class="details-item-label">💳 Total Outflows (Expenses)</span>
            <span class="details-item-value color-red">-${formatMoney(summary.totalExpenses)}</span>
          </div>
          <div class="details-item">
            <span class="details-item-label">🛡️ Financial Runway</span>
            <span class="details-item-value color-yellow">${runwayMonths} months covered</span>
          </div>
          <div class="details-item">
            <span class="details-item-label">📈 Net Worth (Liquid + Goals)</span>
            <span class="details-item-value color-ai">${formatMoney(summary.totalBalance + summary.totalGoalSavings)}</span>
          </div>
        </div>
      `;
    } else if (kpiType === 'expenses') {
      titleEl.textContent = 'Expense Breakdown by Category';
      const categoryTotals = {};
      state.transactions.filter(t => t.type === 'expense').forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
      });
      const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

      contentHTML = `
        <div class="details-hero">
          <div class="details-badge-row"><span class="badge-red">Monthly Burn</span></div>
          <div class="details-amount color-red">${formatMoney(summary.totalExpenses)}</div>
          <div class="details-title">Across ${summary.expenseCount} recorded charges</div>
        </div>
        <div class="category-breakdown-list">
          ${sorted.map(([cat, amt]) => {
            const pct = summary.totalExpenses > 0 ? Math.round((amt / summary.totalExpenses) * 100) : 0;
            return `
              <div class="cat-breakdown-item">
                <div class="cat-breakdown-head">
                  <span>${getCategoryIcon(cat)} ${escapeHTML(cat)}</span>
                  <span>${formatMoney(amt)} (${pct}%)</span>
                </div>
                <div class="details-progress-bar">
                  <div class="details-progress-fill" style="width:${pct}%; background:var(--color-red);"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else if (kpiType === 'income') {
      titleEl.textContent = 'Income Streams & Inflows';
      const categoryTotals = {};
      state.transactions.filter(t => t.type === 'income').forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
      });
      const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

      contentHTML = `
        <div class="details-hero">
          <div class="details-badge-row">
            <span class="badge-green">Gross Revenues</span>
            <span class="badge-neutral" style="cursor:pointer;" id="btnDetailsChangeSalary">💼 Base Salary: ${formatMoney(state.monthlySalary ? state.monthlySalary.amount : 0)}/mo (Edit ⚙️)</span>
          </div>
          <div class="details-amount color-green">+${formatMoney(summary.totalIncome)}</div>
          <div class="details-title">${summary.incomeCount} active income streams</div>
        </div>
        <div class="category-breakdown-list">
          ${sorted.map(([cat, amt]) => {
            const pct = summary.totalIncome > 0 ? Math.round((amt / summary.totalIncome) * 100) : 0;
            return `
              <div class="cat-breakdown-item">
                <div class="cat-breakdown-head">
                  <span>${getCategoryIcon(cat)} ${escapeHTML(cat)}</span>
                  <span>${formatMoney(amt)} (${pct}%)</span>
                </div>
                <div class="details-progress-bar">
                  <div class="details-progress-fill" style="width:${pct}%; background:var(--color-green);"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else if (kpiType === 'savings' || kpiType === 'health') {
      titleEl.textContent = 'AI Financial Health & 50/30/20 Details';
      contentHTML = `
        <div class="details-hero">
          <div class="details-badge-row"><span class="badge-ai">Score: ${summary.aiHealthScore}/100</span></div>
          <div class="details-amount color-ai">${summary.healthStatus}</div>
          <div class="details-title">Evaluated against 50/30/20 Guidelines</div>
        </div>
        <div class="details-list">
          <div class="details-item">
            <span class="details-item-label">🏠 Needs (Rent, Utilities, Food)</span>
            <span class="details-item-value">${rule.needsPct}% (${formatMoney(rule.needs)})</span>
          </div>
          <div class="details-item">
            <span class="details-item-label">🍿 Wants (Entertainment, Leisure)</span>
            <span class="details-item-value">${rule.wantsPct}% (${formatMoney(rule.wants)})</span>
          </div>
          <div class="details-item">
            <span class="details-item-label">💰 Savings &amp; Investments</span>
            <span class="details-item-value color-green">${rule.savingsPct}% (${formatMoney(rule.savings)})</span>
          </div>
          <div class="details-item">
            <span class="details-item-label">🎯 Goal Milestones Total</span>
            <span class="details-item-value color-yellow">${formatMoney(summary.totalGoalSavings)}</span>
          </div>
        </div>
      `;
    } else {
      titleEl.textContent = 'Goal Portfolio Breakdown';
      contentHTML = `
        <div class="details-hero">
          <div class="details-badge-row"><span class="badge-yellow">Overall Progress</span></div>
          <div class="details-amount color-yellow">${summary.goalsOverallProgress}%</div>
          <div class="details-title">${summary.activeGoalsCount} in progress, ${summary.completedGoalsCount} achieved</div>
        </div>
        <div class="details-list">
          ${state.goals.map(g => {
            const pct = Math.round((g.current / g.target) * 100);
            return `
              <div class="details-item">
                <span class="details-item-label">${g.icon || '🎯'} ${escapeHTML(g.title)}</span>
                <span class="details-item-value">${formatMoney(g.current)} / ${formatMoney(g.target)} (${pct}%)</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    bodyEl.innerHTML = contentHTML;
    modal.classList.remove('hidden');

    const btnSalaryFromDtl = document.getElementById('btnDetailsChangeSalary');
    if (btnSalaryFromDtl) {
      btnSalaryFromDtl.addEventListener('click', () => {
        closeKpiDetailsModal();
        openSalaryModal();
      });
    }
  }

  function closeKpiDetailsModal() {
    const modal = document.getElementById('kpiDetailsModal');
    if (modal) modal.classList.add('hidden');
  }

  function openGoalDetailsModal(goalId) {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;

    const modal = document.getElementById('goalDetailsModal');
    const titleEl = document.getElementById('goalDetailsTitle');
    const bodyEl = document.getElementById('goalDetailsBody');

    const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
    const remaining = Math.max(0, goal.target - goal.current);

    let daysLeft = 30;
    if (goal.deadline) {
      const today = new Date();
      const deadlineDate = new Date(goal.deadline);
      const diffTime = deadlineDate - today;
      daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    const dailyPace = remaining / daysLeft;
    const weeklyPace = dailyPace * 7;
    const monthlyPace = dailyPace * 30.4;

    titleEl.textContent = `Roadmap: ${goal.title}`;
    bodyEl.innerHTML = `
      <div class="details-hero">
        <div class="details-badge-row">
          <span class="category-pill">${goal.icon || '🎯'} Milestone</span>
          <span class="${goal.current >= goal.target ? 'badge-green' : 'badge-yellow'}">${pct}% Funded</span>
        </div>
        <div class="details-amount color-yellow">${formatMoney(goal.current)}</div>
        <div class="details-title">Target: ${formatMoney(goal.target)}</div>
      </div>
      <div class="details-list">
        <div class="details-item">
          <span class="details-item-label">⏳ Days to Deadline</span>
          <span class="details-item-value">${daysLeft} days left (${formatDate(goal.deadline)})</span>
        </div>
        <div class="details-item">
          <span class="details-item-label">🗓️ Daily Savings Required</span>
          <span class="details-item-value">${formatMoney(dailyPace)} / day</span>
        </div>
        <div class="details-item">
          <span class="details-item-label">📅 Weekly Savings Pace</span>
          <span class="details-item-value">${formatMoney(weeklyPace)} / week</span>
        </div>
        <div class="details-item">
          <span class="details-item-label">📊 Monthly Savings Pace</span>
          <span class="details-item-value color-yellow">${formatMoney(monthlyPace)} / month</span>
        </div>
      </div>
      <div class="modal-footer" style="margin-top: 1rem;">
        <button type="button" class="btn btn-yellow" id="btnDepositFromDetails">Contribute Funds</button>
        <button type="button" class="btn btn-secondary" id="btnCloseGoalDetailsAction">Close</button>
      </div>
    `;

    modal.classList.remove('hidden');

    const btnDep = document.getElementById('btnDepositFromDetails');
    if (btnDep) {
      btnDep.addEventListener('click', () => {
        closeGoalDetailsModal();
        openContributeModal(goal.id);
      });
    }

    const btnCls = document.getElementById('btnCloseGoalDetailsAction');
    if (btnCls) {
      btnCls.addEventListener('click', closeGoalDetailsModal);
    }
  }

  function closeGoalDetailsModal() {
    const modal = document.getElementById('goalDetailsModal');
    if (modal) modal.classList.add('hidden');
  }

  // =========================================================================
  // 14C. Dedicated Monthly Salary Settings Engine
  // =========================================================================
  function openSalaryModal() {
    const modal = document.getElementById('salaryModal');
    if (!modal) return;

    if (!state.monthlySalary) {
      const existingSalaryTx = state.transactions.find(t => t.category === 'Salary & Wages');
      state.monthlySalary = {
        amount: existingSalaryTx ? Number(existingSalaryTx.amount) : 4850.00,
        frequency: 'monthly',
        payDay: '1',
        source: existingSalaryTx ? (existingSalaryTx.note || 'Monthly Senior Tech Salary') : 'Monthly Senior Tech Salary',
        autoSync: true
      };
    }

    document.getElementById('settingSalaryAmount').value = state.monthlySalary.amount;
    document.getElementById('settingSalaryFrequency').value = state.monthlySalary.frequency || 'monthly';
    document.getElementById('settingSalaryPayDay').value = state.monthlySalary.payDay || '1';
    document.getElementById('settingSalarySource').value = state.monthlySalary.source || '';
    document.getElementById('settingSalaryAutoSync').checked = state.monthlySalary.autoSync !== false;

    updateSalaryPreviewCalculations();
    modal.classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('settingSalaryAmount').focus();
    }, 100);
  }

  function closeSalaryModal() {
    const modal = document.getElementById('salaryModal');
    if (modal) modal.classList.add('hidden');
  }

  function updateSalaryPreviewCalculations() {
    const amountInput = document.getElementById('settingSalaryAmount');
    const freqInput = document.getElementById('settingSalaryFrequency');
    if (!amountInput || !freqInput) return;

    const monthlyAmount = Math.max(0, parseFloat(amountInput.value) || 0);
    const frequency = freqInput.value;

    let annualGross = monthlyAmount * 12;
    let periodPay = monthlyAmount;

    if (frequency === 'biweekly') {
      periodPay = annualGross / 26;
    } else if (frequency === 'semimonthly') {
      periodPay = monthlyAmount / 2;
    } else if (frequency === 'weekly') {
      periodPay = annualGross / 52;
    }

    const dailyEarning = annualGross / 365;

    // 50/30/20 ideal amounts
    const needs50 = monthlyAmount * 0.50;
    const wants30 = monthlyAmount * 0.30;
    const savings20 = monthlyAmount * 0.20;

    const elAnnual = document.getElementById('salaryCalcAnnual');
    const elPeriod = document.getElementById('salaryCalcPeriod');
    const elDaily = document.getElementById('salaryCalcDaily');
    const elNeeds = document.getElementById('salaryValNeeds');
    const elWants = document.getElementById('salaryValWants');
    const elSavings = document.getElementById('salaryValSavings');

    if (elAnnual) elAnnual.textContent = formatMoneyNoCents(annualGross);
    if (elPeriod) elPeriod.textContent = formatMoney(periodPay);
    if (elDaily) elDaily.textContent = formatMoneyNoCents(dailyEarning);
    if (elNeeds) elNeeds.textContent = `${formatMoneyNoCents(needs50)}/mo`;
    if (elWants) elWants.textContent = `${formatMoneyNoCents(wants30)}/mo`;
    if (elSavings) elSavings.textContent = `${formatMoneyNoCents(savings20)}/mo`;
  }

  function handleSaveSalary(e) {
    e.preventDefault();
    const amountVal = parseFloat(document.getElementById('settingSalaryAmount').value);
    if (isNaN(amountVal) || amountVal < 0) {
      showToast('Please enter a valid salary amount', 'error');
      return;
    }

    const frequency = document.getElementById('settingSalaryFrequency').value;
    const payDay = document.getElementById('settingSalaryPayDay').value;
    const source = document.getElementById('settingSalarySource').value.trim() || 'Monthly Senior Tech Salary';
    const autoSync = document.getElementById('settingSalaryAutoSync').checked;

    state.monthlySalary = {
      amount: amountVal,
      frequency,
      payDay,
      source,
      autoSync
    };

    // If autoSync is enabled, synchronize with transaction ledger
    if (autoSync) {
      const salaryTx = state.transactions.find(t => t.type === 'income' && (t.category === 'Salary & Wages' || t.category === 'Salary'));
      if (salaryTx) {
        salaryTx.amount = amountVal;
        salaryTx.note = source;
      } else {
        // Create a new salary transaction
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const dayStr = payDay === 'last' ? '28' : String(payDay).padStart(2, '0');
        const txDate = `${year}-${month}-${dayStr}`;

        state.transactions.unshift({
          id: `tx-salary-${Date.now()}`,
          type: 'income',
          amount: amountVal,
          category: 'Salary & Wages',
          date: txDate,
          note: source,
          method: 'Bank Transfer'
        });
      }
    }

    saveState();
    refreshAllViews();
    closeSalaryModal();
    showToast(`Recurring monthly salary updated to ${formatMoney(amountVal)}/mo!`, 'success');
  }

  // =========================================================================
  // 14D. Google Pay Web API Integration Engine
  // =========================================================================
  let gpayClient = null;
  let currentGPayPayload = null; // { type: 'goal' | 'tx' | 'quick', amount, note, category, goalId, txType }

  function getGooglePaymentsClient() {
    if (gpayClient === null && window.google && window.google.payments && window.google.payments.api) {
      try {
        gpayClient = new window.google.payments.api.PaymentsClient({
          environment: 'TEST'
        });
      } catch (err) {
        console.warn('Could not initialize Google PaymentsClient, using fallback:', err);
      }
    }
    return gpayClient;
  }

  function initGooglePay() {
    renderAllGooglePayButtons();
  }
  window.initGooglePay = initGooglePay;

  function createCustomGPayButton(label, onClickHandler) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gpay-btn-standard';
    btn.innerHTML = `
      <svg viewBox="0 0 40 40" width="22" height="22">
        <rect width="40" height="40" rx="8" fill="#ffffff"/>
        <path d="M19.6 19.3v3.8h-1.2V13h3.3c.8 0 1.5.3 2.1.8.6.6.9 1.3.9 2.1s-.3 1.5-.9 2.1c-.6.5-1.3.8-2.1.8h-2.1v-.5zm0-5.1v3.9h2.1c.5 0 1-.2 1.3-.5.4-.4.6-.8.6-1.4 0-.6-.2-1-.6-1.4-.4-.4-.8-.6-1.3-.6h-2.1zM28.4 17.5c.9 0 1.6.2 2.1.7.5.5.8 1.1.8 2v4.1h-1.2v-.9h-.1c-.5.7-1.2 1.1-2 1.1-.7 0-1.3-.2-1.8-.6-.5-.4-.7-.9-.7-1.6 0-.7.3-1.2.8-1.6.5-.4 1.2-.6 2.1-.6.7 0 1.3.1 1.8.4v-.3c0-.4-.2-.8-.5-1.1-.3-.3-.8-.5-1.3-.5-.7 0-1.2.3-1.6.8l-1-.7c.6-.8 1.4-1.2 2.5-1.2zm-1.8 5c0 .3.1.6.4.8.3.2.6.3 1 .3.5 0 1-.2 1.3-.6.4-.4.6-.8.6-1.3-.4-.3-.9-.5-1.6-.5-.5 0-.9.1-1.2.3-.3.2-.5.5-.5.7zM37.3 17.7l-4.1 9.4h-1.3l1.5-3.3-2.7-6.1h1.3l2 4.7h.1l1.9-4.7h1.3z" fill="#3c4043"/>
        <path d="M12.4 18.1c0-.4 0-.7-.1-1.1H6.7v2.2h3.2c-.1.8-.6 1.5-1.3 2v1.6h2c1.2-1.1 1.8-2.7 1.8-4.7z" fill="#4285f4"/>
        <path d="M6.7 23.9c1.6 0 3-1.1 3.5-2.6l-2-1.6c-.5.3-1.1.5-1.5.5-1.2 0-2.2-.8-2.6-1.9H2.1v1.6c1 2.5 2.7 4 4.6 4z" fill="#34a853"/>
        <path d="M4.1 18.3c-.1-.3-.2-.7-.2-1.1s.1-.8.2-1.1V14.5H2.1c-.4.9-.6 1.8-.6 2.7s.2 1.9.6 2.7l2-1.6z" fill="#fbbc04"/>
        <path d="M6.7 12.6c.9 0 1.7.3 2.3.9l1.7-1.7c-1-1-2.4-1.6-4-1.6-1.9 0-3.6 1.5-4.6 4l2 1.6c.4-1.1 1.4-1.9 2.6-1.9z" fill="#ea4335"/>
      </svg>
      <span>${label}</span>
    `;
    btn.addEventListener('click', onClickHandler);
    return btn;
  }

  function renderAllGooglePayButtons() {
    // 1. Goal contribute slot
    const goalSlot = document.getElementById('gpayGoalBtnSlot');
    if (goalSlot) {
      goalSlot.innerHTML = '';
      const client = getGooglePaymentsClient();
      if (client && typeof client.createButton === 'function') {
        const btn = client.createButton({
          onClick: onGooglePayGoalDepositClicked,
          buttonColor: 'black',
          buttonType: 'pay',
          buttonSizeMode: 'fill'
        });
        goalSlot.appendChild(btn);
      } else {
        goalSlot.appendChild(createCustomGPayButton('Pay & Deposit with Google Pay', onGooglePayGoalDepositClicked));
      }
    }

    // 2. Transaction modal slot
    const txSlot = document.getElementById('gpayTxBtnSlot');
    if (txSlot) {
      txSlot.innerHTML = '';
      const client = getGooglePaymentsClient();
      if (client && typeof client.createButton === 'function') {
        const btn = client.createButton({
          onClick: onGooglePayTxSubmitClicked,
          buttonColor: 'black',
          buttonType: 'pay',
          buttonSizeMode: 'fill'
        });
        txSlot.appendChild(btn);
      } else {
        txSlot.appendChild(createCustomGPayButton('Pay & Save with Google Pay', onGooglePayTxSubmitClicked));
      }
    }

    // 3. Quick Pay modal slot
    const quickSlot = document.getElementById('gpayQuickBtnSlot');
    if (quickSlot) {
      quickSlot.innerHTML = '';
      const client = getGooglePaymentsClient();
      if (client && typeof client.createButton === 'function') {
        const btn = client.createButton({
          onClick: onGooglePayQuickPayClicked,
          buttonColor: 'black',
          buttonType: 'pay',
          buttonSizeMode: 'fill'
        });
        quickSlot.appendChild(btn);
      } else {
        quickSlot.appendChild(createCustomGPayButton('Authorize & Pay with Google Pay', onGooglePayQuickPayClicked));
      }
    }
  }

  function openQuickGPayModal() {
    const modal = document.getElementById('quickGPayModal');
    if (!modal) return;
    document.getElementById('quickGPayNote').value = '';
    document.getElementById('quickGPayAmount').value = '';
    renderAllGooglePayButtons();
    modal.classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('quickGPayNote').focus();
    }, 100);
  }

  function closeQuickGPayModal() {
    const modal = document.getElementById('quickGPayModal');
    if (modal) modal.classList.add('hidden');
  }

  function onGooglePayGoalDepositClicked(e) {
    if (e && e.preventDefault) e.preventDefault();
    const goalId = document.getElementById('contributeGoalId').value;
    const amountVal = parseFloat(document.getElementById('contributeAmount').value);
    const goal = state.goals.find(g => g.id === goalId);

    if (isNaN(amountVal) || amountVal <= 0) {
      showToast('Please enter a valid deposit amount first', 'error');
      document.getElementById('contributeAmount').focus();
      return;
    }

    startGPayPaymentFlow({
      type: 'goal',
      goalId,
      amount: amountVal,
      note: `Goal Deposit: ${goal ? goal.title : 'Milestone Target'}`,
      category: 'Savings Deposit'
    });
  }

  function onGooglePayTxSubmitClicked(e) {
    if (e && e.preventDefault) e.preventDefault();
    const amountVal = parseFloat(document.getElementById('txAmount').value);
    const noteVal = document.getElementById('txNote').value.trim();
    const categoryVal = document.getElementById('txCategory').value;
    const typeVal = document.querySelector('input[name="txType"]:checked').value;

    if (isNaN(amountVal) || amountVal <= 0) {
      showToast('Please enter a valid transaction amount', 'error');
      document.getElementById('txAmount').focus();
      return;
    }

    if (!noteVal) {
      showToast('Please enter description or merchant name', 'error');
      document.getElementById('txNote').focus();
      return;
    }

    startGPayPaymentFlow({
      type: 'tx',
      amount: amountVal,
      note: noteVal,
      category: categoryVal,
      txType: typeVal
    });
  }

  function onGooglePayQuickPayClicked(e) {
    if (e && e.preventDefault) e.preventDefault();
    const noteVal = document.getElementById('quickGPayNote').value.trim();
    const amountVal = parseFloat(document.getElementById('quickGPayAmount').value);
    const categoryVal = document.getElementById('quickGPayCategory').value;

    if (!noteVal) {
      showToast('Please enter payee / merchant', 'error');
      document.getElementById('quickGPayNote').focus();
      return;
    }

    if (isNaN(amountVal) || amountVal <= 0) {
      showToast('Please enter a valid payment amount', 'error');
      document.getElementById('quickGPayAmount').focus();
      return;
    }

    startGPayPaymentFlow({
      type: 'quick',
      amount: amountVal,
      note: noteVal,
      category: categoryVal,
      txType: 'expense'
    });
  }

  function startGPayPaymentFlow(payload) {
    currentGPayPayload = payload;

    // Set sheet values
    document.getElementById('gpaySheetMerchant').textContent = payload.note;
    document.getElementById('gpaySheetAmount').textContent = formatMoney(payload.amount);
    document.getElementById('gpaySheetItem').textContent = payload.type === 'goal' ? 'Goal Milestone Contribution' : `Category: ${payload.category}`;
    document.getElementById('btnConfirmGPaySheet').disabled = false;
    document.getElementById('gpayBtnText').textContent = `Authorize & Pay ${formatMoney(payload.amount)}`;

    const sheetModal = document.getElementById('gpayPaymentSheetModal');
    sheetModal.classList.remove('hidden');
  }

  function closeGPaySheetModal() {
    const modal = document.getElementById('gpayPaymentSheetModal');
    if (modal) modal.classList.add('hidden');
    currentGPayPayload = null;
  }

  function executeGPayPaymentApproval() {
    if (!currentGPayPayload) return;
    const btn = document.getElementById('btnConfirmGPaySheet');
    const btnText = document.getElementById('gpayBtnText');
    btn.disabled = true;
    btnText.textContent = 'Processing with Google Pay... ⏳';

    setTimeout(() => {
      btnText.textContent = 'Payment Approved! ✅';

      setTimeout(() => {
        const payload = currentGPayPayload;
        closeGPaySheetModal();

        const today = new Date().toISOString().split('T')[0];

        if (payload.type === 'goal') {
          const goal = state.goals.find(g => g.id === payload.goalId);
          if (goal) {
            goal.current += payload.amount;
            const completed = goal.current >= goal.target;

            // Log ledger entry
            state.transactions.unshift({
              id: 'tx-gpay-' + Date.now(),
              type: 'expense',
              amount: payload.amount,
              category: 'Savings Deposit',
              method: 'Google Pay (GPay)',
              note: payload.note,
              date: today
            });

            closeContributeModal();
            saveState();
            refreshAllViews();

            if (completed && typeof confetti === 'function') {
              confetti({ particleCount: 130, spread: 80, origin: { y: 0.6 } });
              showToast(`🎉 Goal '${goal.title}' reached 100% via Google Pay!`, 'success');
            } else {
              showToast(`Google Pay payment of ${formatMoney(payload.amount)} deposited to '${goal.title}'!`, 'success');
            }
          }
        } else if (payload.type === 'tx') {
          state.transactions.unshift({
            id: 'tx-gpay-' + Date.now(),
            type: payload.txType || 'expense',
            amount: payload.amount,
            category: payload.category,
            method: 'Google Pay (GPay)',
            note: payload.note,
            date: today
          });

          closeTxModal();
          saveState();
          refreshAllViews();
          showToast(`Google Pay payment of ${formatMoney(payload.amount)} logged successfully!`, 'success');
        } else if (payload.type === 'quick') {
          state.transactions.unshift({
            id: 'tx-gpay-' + Date.now(),
            type: 'expense',
            amount: payload.amount,
            category: payload.category,
            method: 'Google Pay (GPay)',
            note: payload.note,
            date: today
          });

          closeQuickGPayModal();
          saveState();
          refreshAllViews();
          showToast(`Quick Pay via Google Pay completed: ${formatMoney(payload.amount)} to ${payload.note}!`, 'success');
        }
      }, 500);
    }, 900);
  }

  // =========================================================================
  // 15. Master Refresh & Event Binding
  // =========================================================================
  function refreshAllViews() {
    renderKPIs();
    renderAISuggestions();
    renderGoals();
    renderTransactions();
    initOrUpdateCharts();
    renderAllGooglePayButtons();

    document.querySelectorAll('.currency-symbol-label').forEach(el => {
      el.textContent = state.currency;
    });
  }

  function initEvents() {
    // Theme & Background Palette Switcher
    document.getElementById('btnThemeToggle').addEventListener('click', toggleTheme);

    const paletteSelect = document.getElementById('paletteSelect');
    if (paletteSelect) {
      paletteSelect.addEventListener('change', (e) => {
        applyPalette(e.target.value);
        const names = {
          'cosmic-aurora': 'Cosmic Aurora 🌌',
          'midnight-sapphire': 'Midnight Sapphire 💎',
          'emerald-obsidian': 'Emerald Obsidian 🌲',
          'royal-amethyst': 'Royal Amethyst 🔮',
          'champagne-pearl': 'Champagne Pearl 🥂'
        };
        showToast(`Atmosphere set to ${names[e.target.value] || e.target.value}`, 'ai');
      });
    }

    // Navigation View Switchers
    document.getElementById('navBrandLogo').addEventListener('click', () => navigateTo('home'));
    document.getElementById('navLinkHome').addEventListener('click', () => navigateTo('home'));
    document.getElementById('navLinkFeatures').addEventListener('click', () => navigateTo('home', 'homeFeaturesSection'));
    document.getElementById('navLinkDashboard').addEventListener('click', () => navigateTo('dashboard'));

    document.getElementById('btnHeroDashboard').addEventListener('click', () => navigateTo('dashboard'));
    document.getElementById('btnHeroDemo').addEventListener('click', demoLogin);
    document.getElementById('btnCtaGetStarted').addEventListener('click', () => navigateTo('dashboard'));

    document.getElementById('btnFooterHome').addEventListener('click', () => navigateTo('home'));
    document.getElementById('btnFooterDashboard').addEventListener('click', () => navigateTo('dashboard'));

    // Auth Navigation
    document.getElementById('btnNavLogin').addEventListener('click', () => navigateTo('auth'));
    document.getElementById('btnNavLogout').addEventListener('click', logoutUser);
    document.getElementById('btnQuickDemoLogin').addEventListener('click', demoLogin);

    // Auth Tabs & Form
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const groupAuthName = document.getElementById('groupAuthName');
    const authCardTitle = document.getElementById('authCardTitle');
    const btnAuthSubmit = document.getElementById('btnAuthSubmit');
    const authSwitchPrompt = document.getElementById('authSwitchPrompt');
    const linkSwitchToRegister = document.getElementById('linkSwitchToRegister');
    let isRegisterMode = false;

    function setAuthMode(register) {
      isRegisterMode = register;
      if (register) {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        groupAuthName.classList.remove('hidden');
        authCardTitle.textContent = 'Create an Account';
        btnAuthSubmit.textContent = 'Create Account';
        authSwitchPrompt.innerHTML = 'Already have an account? <a href="#" id="linkSwitchToLogin">Sign in here</a>';
        const linkToLogin = document.getElementById('linkSwitchToLogin');
        if (linkToLogin) linkToLogin.addEventListener('click', (e) => { e.preventDefault(); setAuthMode(false); });
      } else {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        groupAuthName.classList.add('hidden');
        authCardTitle.textContent = 'Welcome Back';
        btnAuthSubmit.textContent = 'Sign In to Dashboard';
        authSwitchPrompt.innerHTML = 'Don\'t have an account? <a href="#" id="linkSwitchToRegister">Create one for free</a>';
        const linkToReg = document.getElementById('linkSwitchToRegister');
        if (linkToReg) linkToReg.addEventListener('click', (e) => { e.preventDefault(); setAuthMode(true); });
      }
    }

    tabLogin.addEventListener('click', () => setAuthMode(false));
    tabRegister.addEventListener('click', () => setAuthMode(true));
    if (linkSwitchToRegister) {
      linkSwitchToRegister.addEventListener('click', (e) => { e.preventDefault(); setAuthMode(true); });
    }

    document.getElementById('authForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('authEmail').value.trim();
      const name = isRegisterMode 
        ? (document.getElementById('authName').value.trim() || 'Alex Johnson')
        : email.split('@')[0];

      loginUser(name, email);
    });

    // Currency Switcher
    const currencySelect = document.getElementById('currencySelect');
    if (currencySelect) {
      currencySelect.value = state.currency;
      currencySelect.addEventListener('change', (e) => {
        state.currency = e.target.value;
        saveState();
        refreshAllViews();
        showToast(`Currency updated to ${state.currency}`, 'info');
      });
    }

    // Modal Triggers: Transactions
    document.getElementById('btnOpenTxModal').addEventListener('click', () => openTxModal());
    document.getElementById('btnNewTxFromSection').addEventListener('click', () => openTxModal());
    document.getElementById('btnCloseTxModal').addEventListener('click', closeTxModal);
    document.getElementById('btnCancelTxModal').addEventListener('click', closeTxModal);
    document.getElementById('txForm').addEventListener('submit', handleSaveTransaction);

    // Modal Triggers: Goals
    document.getElementById('btnOpenGoalModal').addEventListener('click', openGoalModal);
    document.getElementById('btnNewGoalFromSection').addEventListener('click', openGoalModal);
    document.getElementById('btnCloseGoalModal').addEventListener('click', closeGoalModal);
    document.getElementById('btnCancelGoalModal').addEventListener('click', closeGoalModal);
    document.getElementById('goalForm').addEventListener('submit', handleSaveGoal);

    // Modal Triggers: Contribute
    document.getElementById('btnCloseContributeModal').addEventListener('click', closeContributeModal);
    document.getElementById('btnCancelContributeModal').addEventListener('click', closeContributeModal);
    document.getElementById('contributeForm').addEventListener('submit', handleSaveContribution);

    // Toggle Expense vs Income in modal
    document.getElementById('labelTypeExpense').addEventListener('click', () => setTxType('expense'));
    document.getElementById('labelTypeIncome').addEventListener('click', () => setTxType('income'));

    // Transaction Filters
    const typeTabs = document.querySelectorAll('#typeFilterTabs .tab-btn');
    typeTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        typeTabs.forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.filterType = e.currentTarget.dataset.type;
        renderTransactions();
      });
    });

    const searchInput = document.getElementById('txSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.filterSearch = e.target.value;
        renderTransactions();
      });
    }

    const categoryFilter = document.getElementById('txCategoryFilter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        state.filterCategory = e.target.value;
        renderTransactions();
      });
    }

    const methodFilter = document.getElementById('txMethodFilter');
    if (methodFilter) {
      methodFilter.addEventListener('change', (e) => {
        state.filterMethod = e.target.value;
        renderTransactions();
      });
    }

    // AI Re-Analyze Button
    document.getElementById('btnRefreshAI').addEventListener('click', () => {
      renderAISuggestions();
      showToast('AI re-analyzed your latest spending behaviors!', 'ai');
    });

    // Reset & Export
    document.getElementById('btnLoadDemo').addEventListener('click', loadDemoData);
    document.getElementById('btnResetAll').addEventListener('click', resetAllData);
    document.getElementById('btnExportCSV').addEventListener('click', exportCSV);

    // Transaction Details Modal actions
    const btnCloseTxDtl = document.getElementById('btnCloseTxDetailsModal');
    if (btnCloseTxDtl) btnCloseTxDtl.addEventListener('click', closeTxDetailsModal);
    const btnCloseTxDtlAct = document.getElementById('btnCloseTxDetailsAction');
    if (btnCloseTxDtlAct) btnCloseTxDtlAct.addEventListener('click', closeTxDetailsModal);

    const btnEditFromDtl = document.getElementById('btnEditFromDetails');
    if (btnEditFromDtl) {
      btnEditFromDtl.addEventListener('click', () => {
        const id = currentViewingTxId;
        closeTxDetailsModal();
        if (id) openTxModal(id);
      });
    }

    const btnDelFromDtl = document.getElementById('btnDeleteFromDetails');
    if (btnDelFromDtl) {
      btnDelFromDtl.addEventListener('click', () => {
        const id = currentViewingTxId;
        closeTxDetailsModal();
        if (id) deleteTransaction(id);
      });
    }

    // KPI & Health Deep-Dive Details triggers
    const btnCloseKpiDtl = document.getElementById('btnCloseKpiDetailsModal');
    if (btnCloseKpiDtl) btnCloseKpiDtl.addEventListener('click', closeKpiDetailsModal);

    const elKpiBal = document.getElementById('kpiBalance');
    if (elKpiBal) elKpiBal.closest('.kpi-card').addEventListener('click', () => openKpiDetailsModal('balance'));

    const elKpiInc = document.getElementById('kpiIncome');
    if (elKpiInc) elKpiInc.closest('.kpi-card').addEventListener('click', () => openKpiDetailsModal('income'));

    const elKpiExp = document.getElementById('kpiExpenses');
    if (elKpiExp) elKpiExp.closest('.kpi-card').addEventListener('click', () => openKpiDetailsModal('expenses'));

    const elKpiSav = document.getElementById('kpiSavings');
    if (elKpiSav) elKpiSav.closest('.kpi-card').addEventListener('click', () => openKpiDetailsModal('savings'));

    const elKpiGls = document.getElementById('kpiGoalsProgress');
    if (elKpiGls) elKpiGls.closest('.kpi-card').addEventListener('click', () => openKpiDetailsModal('goals'));

    const healthPill = document.getElementById('healthScorePill');
    if (healthPill) healthPill.addEventListener('click', () => openKpiDetailsModal('health'));

    // Monthly Salary Setting Triggers
    const btnOpenSal = document.getElementById('btnOpenSalaryModal');
    if (btnOpenSal) btnOpenSal.addEventListener('click', openSalaryModal);

    const kpiSalarySubPill = document.getElementById('kpiSalarySubPill');
    if (kpiSalarySubPill) {
      kpiSalarySubPill.addEventListener('click', (e) => {
        e.stopPropagation();
        openSalaryModal();
      });
    }

    const btnCloseSal = document.getElementById('btnCloseSalaryModal');
    if (btnCloseSal) btnCloseSal.addEventListener('click', closeSalaryModal);

    const btnCancelSal = document.getElementById('btnCancelSalaryModal');
    if (btnCancelSal) btnCancelSal.addEventListener('click', closeSalaryModal);

    const salaryForm = document.getElementById('salaryForm');
    if (salaryForm) salaryForm.addEventListener('submit', handleSaveSalary);

    const salaryAmtInput = document.getElementById('settingSalaryAmount');
    if (salaryAmtInput) salaryAmtInput.addEventListener('input', updateSalaryPreviewCalculations);

    const salaryFreqSelect = document.getElementById('settingSalaryFrequency');
    if (salaryFreqSelect) salaryFreqSelect.addEventListener('change', updateSalaryPreviewCalculations);

    // Google Pay Quick Pay & Sheet Actions
    const btnQuickGPay = document.getElementById('btnQuickGPayModal');
    if (btnQuickGPay) btnQuickGPay.addEventListener('click', openQuickGPayModal);

    const btnCloseQuickGPay = document.getElementById('btnCloseQuickGPayModal');
    if (btnCloseQuickGPay) btnCloseQuickGPay.addEventListener('click', closeQuickGPayModal);

    const btnCancelQuickGPay = document.getElementById('btnCancelQuickGPay');
    if (btnCancelQuickGPay) btnCancelQuickGPay.addEventListener('click', closeQuickGPayModal);

    const btnCloseGPSheet = document.getElementById('btnCloseGPaySheet');
    if (btnCloseGPSheet) btnCloseGPSheet.addEventListener('click', closeGPaySheetModal);

    const btnCancelGPSheet = document.getElementById('btnCancelGPaySheet');
    if (btnCancelGPSheet) btnCancelGPSheet.addEventListener('click', closeGPaySheetModal);

    const btnConfirmGPSheet = document.getElementById('btnConfirmGPaySheet');
    if (btnConfirmGPSheet) btnConfirmGPSheet.addEventListener('click', executeGPayPaymentApproval);

    // Goal Details Modal close
    const btnCloseGoalDtl = document.getElementById('btnCloseGoalDetailsModal');
    if (btnCloseGoalDtl) btnCloseGoalDtl.addEventListener('click', closeGoalDetailsModal);

    // Close modals on overlay backdrop click
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.add('hidden');
      }
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
      }
    });
  }

  // =========================================================================
  // 16. App Initialization
  // =========================================================================
  function init() {
    loadState();
    initEvents();
    initAIChat();
    updateAuthUI();

    // Default landing: show Home page
    navigateTo('home');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
