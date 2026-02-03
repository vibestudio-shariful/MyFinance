import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Landmark, 
  HandCoins, 
  UserCircle, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  History,
  Download,
  Upload,
  Info,
  Trash2,
  CheckCircle2,
  X,
  Camera,
  CalendarDays,
  User,
  Languages,
  Moon,
  Sun,
  UserPlus,
  ArrowRight,
  Pencil,
  FileJson,
  Database
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { Transaction, Saving, Debt, UserProfile, AppData, TransactionType, Settings, DebtActionType } from './types';

// Constants
const STORAGE_KEY = 'my_finance_data_v1';

const DEFAULT_PROFILE: UserProfile = {
  name: 'User00001',
  email: 'mail@example.com',
  avatar: '' 
};

const DEFAULT_SETTINGS: Settings = {
  language: 'bn',
  theme: 'light'
};

const INITIAL_DATA: AppData = {
  transactions: [],
  savings: [],
  debts: [],
  parties: [],
  profile: DEFAULT_PROFILE,
  settings: DEFAULT_SETTINGS
};

// Translations
const translations = {
  bn: {
    home: "হোম",
    transactions: "লেনদেন",
    savings: "সঞ্চয়",
    profile: "প্রোফাইল",
    totalSavings: "মোট সঞ্চয়",
    currentBalance: "বর্তমান ব্যালেন্স",
    income: "আয়",
    expense: "ব্যয়",
    iWillGet: "আমি পাব",
    theyWillGet: "আমার কাছে পাবে",
    history: "ইতিহাস",
    addTransaction: "নতুন লেনদেন",
    addSaving: "সঞ্চয় আপডেট",
    addDebt: "পাওনা বা দেনা",
    personName: "ব্যক্তির নাম",
    amount: "টাকার পরিমাণ",
    category: "ক্যাটাগরি",
    description: "বিবরণ",
    dateTime: "তারিখ ও সময়",
    confirm: "নিশ্চিত করুন",
    save: "সেভ করুন",
    cancel: "বাতিল",
    delete: "মুছে ফেলা",
    resolve: "পরিশোধ",
    resolved: "পরিশোধিত",
    settings: "সেটিংস",
    language: "ভাষা",
    theme: "থিম",
    light: "লাইট",
    dark: "ডার্ক",
    developerInfo: "ডেভেলপার তথ্য",
    backup: "ব্যাকআপ ও রিস্টোর",
    fullBackup: "ফুল ব্যাকআপ এক্সপোর্ট",
    transactionsBackup: "লেনদেন ব্যাকআপ",
    savingsBackup: "সঞ্চয় ব্যাকআপ",
    debtsBackup: "দেনাপাওনা ব্যাকআপ",
    fullRestore: "ব্যাকআপ রিস্টোর",
    noData: "কোন তথ্য নেই",
    taka: "৳",
    parties: "দেনাপাওনা",
    addNewPerson: "নতুন ব্যক্তি যোগ করুন",
    taken: "গৃহীত/প্রদত্ত",
    repaid: "পরিশোধিত",
    selectPerson: "ব্যক্তি নির্বাচন করুন",
    type: "ধরণ",
    recentTransactions: "সাম্প্রতিক লেনদেন",
    monthlyTotalIncome: "মাসের মোট আয়",
    handCash: "বর্তমানে হাতে আছে",
    edit: "সম্পাদনা",
    incomeList: "আয়ের তালিকা",
    expenseList: "ব্যয়ের তালিকা",
    selectiveBackup: "আলাদা ব্যাকআপ করুন"
  },
  en: {
    home: "Home",
    transactions: "Transactions",
    savings: "Savings",
    profile: "Profile",
    totalSavings: "Total Savings",
    currentBalance: "Current Balance",
    income: "Income",
    expense: "Expense",
    iWillGet: "I'll Get",
    theyWillGet: "I'll Give",
    history: "History",
    addTransaction: "Add Transaction",
    addSaving: "Update Savings",
    addDebt: "Debt Record",
    personName: "Name",
    amount: "Amount",
    category: "Category",
    description: "Description",
    dateTime: "Date & Time",
    confirm: "Confirm",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    resolve: "Resolve",
    resolved: "Resolved",
    settings: "Settings",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    developerInfo: "Developer Info",
    backup: "Backup & Restore",
    fullBackup: "Full Backup Export",
    transactionsBackup: "Transactions Backup",
    savingsBackup: "Savings Backup",
    debtsBackup: "Debts Backup",
    fullRestore: "Restore Backup",
    noData: "No data found",
    taka: "৳",
    parties: "Debts",
    addNewPerson: "Add New Person",
    taken: "Taken/Given",
    repaid: "Repaid",
    selectPerson: "Select Person",
    type: "Type",
    recentTransactions: "Recent Transactions",
    monthlyTotalIncome: "Monthly Total Income",
    handCash: "Hand Cash Available",
    edit: "Edit",
    incomeList: "Income List",
    expenseList: "Expense List",
    selectiveBackup: "Selective Backup"
  }
};

const Avatar = ({ src, size = "w-14 h-14", iconSize = 24, className = "" }: { src?: string, size?: string, iconSize?: number, className?: string }) => {
  if (src && src.trim() !== "") {
    return <img src={src} alt="Avatar" className={`${size} rounded-2xl border-2 border-indigo-50 dark:border-slate-700 object-cover shadow-sm ${className}`} />;
  }
  return (
    <div className={`${size} rounded-2xl border-2 border-indigo-50 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm ${className}`}>
      <User size={iconSize} />
    </div>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'debts' | 'savings' | 'profile'>('dashboard');
  const [debtFilter, setDebtFilter] = useState<'ALL' | 'RECEIVABLE' | 'PAYABLE'>('ALL');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'transaction' | 'saving' | 'debt' | 'dev' | 'monthlySummary' | 'partyDetail' | 'addParty' | 'filteredTransactions'>('transaction');
  const [transactionListFilter, setTransactionListFilter] = useState<TransactionType>('INCOME');
  const [selectedPartyName, setSelectedPartyName] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const t = translations[data.settings.language];

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData({
          ...INITIAL_DATA,
          ...parsed,
          settings: parsed.settings || DEFAULT_SETTINGS
        });
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (data.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#020617'); 
    } else {
      document.documentElement.classList.remove('dark');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#f8fafc'); 
    }
  }, [data]);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleExport = async (type: 'all' | 'transactions' | 'savings' | 'debts') => {
    const exportData = type === 'all' ? data : data[type as keyof AppData];
    const content = JSON.stringify(exportData, null, 2);
    const fileName = `finance_${type}_${format(new Date(), 'yyyyMMdd_HHmm')}.json`;

    // Try to use File System Access API for location selection
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        triggerToast(t.confirm);
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        // Fallback to regular download if API fails or user cancels differently
      }
    }

    // Standard Fallback Download
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    triggerToast(t.confirm);
  };

  const filteredTransactions = useMemo(() => {
    return data.transactions.filter(tr => {
      const d = parseISO(tr.date);
      return isWithinInterval(d, { start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
    });
  }, [data.transactions, currentMonth]);

  const monthlyIncome = filteredTransactions.filter(tr => tr.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const monthlyExpense = filteredTransactions.filter(tr => tr.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalHandCash = useMemo(() => {
    return data.transactions.reduce((acc, tr) => 
      tr.type === 'INCOME' ? acc + tr.amount : acc - tr.amount, 0);
  }, [data.transactions]);

  const totalSavings = data.savings.reduce((acc, curr) => curr.type === 'ADD' ? acc + curr.amount : acc - curr.amount, 0);

  const partyBalances = useMemo(() => {
    const balances: Record<string, { total: number, type: 'RECEIVABLE' | 'PAYABLE' }> = {};
    data.debts.forEach(d => {
      if (!balances[d.personName]) balances[d.personName] = { total: 0, type: d.type };
      if (d.actionType === 'TAKEN') balances[d.personName].total += d.amount;
      else balances[d.personName].total -= d.amount;
    });
    return balances;
  }, [data.debts]);

  const totalReceivables = Object.values(partyBalances).filter((b: any) => b.type === 'RECEIVABLE').reduce((acc, curr: any) => acc + curr.total, 0);
  const totalPayables = Object.values(partyBalances).filter((b: any) => b.type === 'PAYABLE').reduce((acc, curr: any) => acc + curr.total, 0);

  const monthlyHistory = useMemo(() => {
    const groups: Record<string, { income: number, expense: number, date: Date }> = {};
    data.transactions.forEach(tr => {
      const d = parseISO(tr.date);
      const key = format(d, 'yyyy-MM');
      if (!groups[key]) groups[key] = { income: 0, expense: 0, date: startOfMonth(d) };
      if (tr.type === 'INCOME') groups[key].income += tr.amount;
      else groups[key].expense += tr.amount;
    });
    return Object.values(groups).sort((a, b) => (b as any).date.getTime() - (a as any).date.getTime());
  }, [data.transactions]);

  const addTransaction = (tr: Omit<Transaction, 'id'>) => {
    setData(prev => ({ ...prev, transactions: [{ ...tr, id: crypto.randomUUID() }, ...prev.transactions] }));
    setIsModalOpen(false);
    triggerToast(data.settings.language === 'bn' ? "লেনদেন যুক্ত হয়েছে" : "Transaction Added");
  };

  const addSaving = (s: Omit<Saving, 'id'>) => {
    setData(prev => ({ ...prev, savings: [{ ...s, id: crypto.randomUUID() }, ...prev.savings] }));
    setIsModalOpen(false);
    triggerToast(data.settings.language === 'bn' ? "সঞ্চয় আপডেট হয়েছে" : "Savings Updated");
  };

  const addDebtRecord = (d: Omit<Debt, 'id'>) => {
    setData(prev => ({ 
      ...prev, 
      debts: [{ ...d, id: crypto.randomUUID() }, ...prev.debts],
      parties: prev.parties.includes(d.personName) ? prev.parties : [...prev.parties, d.personName]
    }));
    setIsModalOpen(false);
    triggerToast(data.settings.language === 'bn' ? "রেকর্ড যুক্ত হয়েছে" : "Record Added");
  };

  const addParty = (name: string) => {
    if (data.parties.includes(name)) return triggerToast("নামটি ইতিমধ্যে আছে", "error");
    setData(prev => ({ ...prev, parties: [...prev.parties, name] }));
    setIsModalOpen(false);
    triggerToast("পার্টি যুক্ত হয়েছে");
  };

  const deleteItem = (type: 'transactions' | 'savings' | 'debts', id: string) => {
    setData(prev => ({ ...prev, [type]: (prev[type] as any[]).filter((item: any) => item.id !== id) }));
    triggerToast(data.settings.language === 'bn' ? "মুছে ফেলা হয়েছে" : "Deleted");
  };

  const toggleLanguage = () => setData(prev => ({ ...prev, settings: { ...prev.settings, language: prev.settings.language === 'bn' ? 'en' : 'bn' } }));
  const toggleTheme = () => setData(prev => ({ ...prev, settings: { ...prev.settings, theme: prev.settings.theme === 'light' ? 'dark' : 'light' } }));

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {showToast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full shadow-lg text-white font-medium flex items-center gap-2 transition-all ${showToast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
          {showToast.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
          {showToast.message}
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {activeTab === 'dashboard' && (
          <Dashboard 
            data={data} t={t}
            income={monthlyIncome} expense={monthlyExpense}
            savings={totalSavings} receivables={totalReceivables} payables={totalPayables}
            month={currentMonth}
            handCash={totalHandCash}
            transactions={filteredTransactions}
            onDeleteTransaction={(id: string) => deleteItem('transactions', id)}
            onPrev={() => setCurrentMonth(subMonths(currentMonth, 1))}
            onNext={() => setCurrentMonth(addMonths(currentMonth, 1))}
            onSummary={() => { setModalType('monthlySummary'); setIsModalOpen(true); }}
            onDebtClick={(f: any) => { setDebtFilter(f); setActiveTab('debts'); }}
            onEditProfile={() => setActiveTab('profile')}
            onShowTransactions={(type: TransactionType) => {
              setTransactionListFilter(type);
              setModalType('filteredTransactions');
              setIsModalOpen(true);
            }}
          />
        )}
        {activeTab === 'debts' && (
          <DebtsView 
            parties={data.parties} balances={partyBalances} filter={debtFilter} onFilter={setDebtFilter} t={t}
            onPartyClick={(name: string) => { setSelectedPartyName(name); setModalType('partyDetail'); setIsModalOpen(true); }}
            onAddParty={() => { setModalType('addParty'); setIsModalOpen(true); }}
          />
        )}
        {activeTab === 'savings' && (
          <SavingsView savings={data.savings} total={totalSavings} t={t} onDelete={(id: string) => deleteItem('savings', id)} />
        )}
        {activeTab === 'profile' && (
          <ProfileView 
            profile={data.profile} settings={data.settings} t={t}
            onUpdateProfile={(p: UserProfile) => setData(prev => ({ ...prev, profile: p }))}
            onLang={toggleLanguage} onTheme={toggleTheme}
            onDev={() => { setModalType('dev'); setIsModalOpen(true); }}
            onExport={handleExport}
            onImport={(e: any) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const r = new FileReader();
                r.onload = (ev) => {
                    try {
                        const json = JSON.parse(ev.target?.result as string);
                        // Simple validation check: if it has profile/settings, it's likely a full backup
                        if (json.settings && json.profile) {
                          setData(json);
                        } else if (Array.isArray(json)) {
                          // Could be a selective backup (array of items)
                          // Heuristic check to decide where to put items
                          const first = json[0];
                          if (first?.personName) setData(prev => ({ ...prev, debts: [...json, ...prev.debts] }));
                          else if (first?.type === 'INCOME' || first?.type === 'EXPENSE') setData(prev => ({ ...prev, transactions: [...json, ...prev.transactions] }));
                          else if (first?.type === 'ADD' || first?.type === 'SUBTRACT') setData(prev => ({ ...prev, savings: [...json, ...prev.savings] }));
                        }
                        triggerToast(t.confirm);
                    } catch { triggerToast("Error Parsing Backup", "error"); }
                };
                r.readAsText(file);
            }}
          />
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex justify-around items-center z-50">
        <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label={t.home} />
        <NavBtn active={activeTab === 'debts'} onClick={() => setActiveTab('debts')} icon={<HandCoins size={20} />} label={t.parties} />
        <button 
          onClick={() => {
            if (activeTab === 'savings') setModalType('saving');
            else if (activeTab === 'debts') setModalType('debt');
            else setModalType('transaction');
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 text-white p-3 rounded-full shadow-lg -translate-y-4 border-4 border-slate-50 dark:border-slate-950 active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
        <NavBtn active={activeTab === 'savings'} onClick={() => setActiveTab('savings'} icon={<Landmark size={20} />} label={t.savings} />
        <NavBtn active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserCircle size={20} />} label={t.profile} />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] p-6 animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            {modalType === 'transaction' && <FormTransaction t={t} date={format(new Date(), "yyyy-MM-dd'T'HH:mm")} onSubmit={addTransaction} onCancel={() => setIsModalOpen(false)} />}
            {modalType === 'saving' && <FormSaving t={t} date={format(new Date(), "yyyy-MM-dd'T'HH:mm")} onSubmit={addSaving} onCancel={() => setIsModalOpen(false)} />}
            {modalType === 'debt' && <FormDebt t={t} parties={data.parties} date={format(new Date(), "yyyy-MM-dd'T'HH:mm")} onSubmit={addDebtRecord} onCancel={() => setIsModalOpen(false)} />}
            {modalType === 'dev' && <DevProfile t={t} onCancel={() => setIsModalOpen(false)} />}
            {modalType === 'partyDetail' && (
              <PartyDetail t={t} name={selectedPartyName!} 
                history={data.debts.filter(d => d.personName === selectedPartyName)}
                onDelete={(id: string) => deleteItem('debts', id)}
                onCancel={() => setIsModalOpen(false)} 
              />
            )}
            {modalType === 'addParty' && <FormAddParty t={t} onSubmit={addParty} onCancel={() => setIsModalOpen(false)} />}
            {modalType === 'monthlySummary' && (
              <MonthlySummaryList t={t} history={monthlyHistory} onCancel={() => setIsModalOpen(false)} onSelect={(d: Date) => { setCurrentMonth(d); setIsModalOpen(false); }} />
            )}
            {modalType === 'filteredTransactions' && (
              <FilteredTransactionsView 
                t={t} 
                type={transactionListFilter}
                transactions={filteredTransactions.filter(tr => tr.type === transactionListFilter)}
                onDelete={(id: string) => deleteItem('transactions', id)}
                onCancel={() => setIsModalOpen(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const NavBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-indigo-600' : 'text-slate-400 dark:text-slate-500'}`}>
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const Dashboard = ({ data, t, income, expense, handCash, receivables, payables, month, transactions, onDeleteTransaction, onPrev, onNext, onSummary, onDebtClick, onEditProfile, onShowTransactions }: any) => (
  <div className="p-6 space-y-6">
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 text-slate-900 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform"></div>
      <div className="relative flex items-center gap-4 mb-6">
        <Avatar src={data.profile.avatar} size="w-14 h-14" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-xl leading-tight truncate">{data.profile.name}</h2>
            <button onClick={onEditProfile} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-indigo-500 transition-colors" title={t.edit}>
              <Pencil size={14} />
            </button>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-medium truncate">{data.profile.email}</p>
        </div>
      </div>
      <div className="relative grid grid-cols-2 gap-4">
        <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-2xl border border-indigo-50 dark:border-indigo-900/20">
          <p className="text-slate-400 text-[9px] uppercase font-bold tracking-widest mb-1">{t.monthlyTotalIncome}</p>
          <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{t.taka}{income.toLocaleString()}</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
          <p className="text-slate-400 text-[9px] uppercase font-bold tracking-widest mb-1">{t.handCash}</p>
          <span className="text-xl font-black text-slate-700 dark:text-slate-100">{t.taka}{handCash.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <div className="flex-1 flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <button onClick={onPrev} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300"><ChevronLeft size={20}/></button>
        <span className="font-semibold text-slate-700 dark:text-slate-200">{format(month, 'MMMM yyyy')}</span>
        <button onClick={onNext} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300"><ChevronRight size={20}/></button>
      </div>
      <button onClick={onSummary} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-indigo-600 active:scale-95 transition-transform"><CalendarDays size={22} /></button>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <button onClick={() => onShowTransactions('INCOME')} className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-4 rounded-3xl text-left active:scale-[0.98] transition-all">
        <div className="bg-emerald-500 text-white w-8 h-8 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-emerald-200 dark:shadow-none"><ArrowDownLeft size={18} /></div>
        <p className="text-emerald-700/70 dark:text-emerald-500/70 text-xs font-medium mb-1">{t.income}</p>
        <p className="text-emerald-700 dark:text-emerald-500 font-bold text-lg">{t.taka}{income.toLocaleString()}</p>
      </button>
      <button onClick={() => onShowTransactions('EXPENSE')} className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 p-4 rounded-3xl text-left active:scale-[0.98] transition-all">
        <div className="bg-rose-500 text-white w-8 h-8 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-rose-200 dark:shadow-none"><ArrowUpRight size={18} /></div>
        <p className="text-rose-700/70 dark:text-rose-500/70 text-xs font-medium mb-1">{t.expense}</p>
        <p className="text-rose-700 dark:text-rose-500 font-bold text-lg">{t.taka}{expense.toLocaleString()}</p>
      </button>
    </div>

    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <HandCoins size={20} className="text-amber-500" />
        <h3 className="font-bold text-slate-800 dark:text-slate-200">{t.iWillGet} & {t.theyWillGet}</h3>
      </div>
      <button onClick={() => onDebtClick('RECEIVABLE')} className="w-full flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg p-2 transition-colors group">
        <span className="text-slate-500 dark:text-slate-400 text-sm">{t.iWillGet}</span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-emerald-600 dark:text-emerald-500">{t.taka}{receivables.toLocaleString()}</span>
          <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-400" />
        </div>
      </button>
      <button onClick={() => onDebtClick('PAYABLE')} className="w-full flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg p-2 transition-colors group">
        <span className="text-slate-500 dark:text-slate-400 text-sm">{t.theyWillGet}</span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-rose-500 dark:text-rose-400">{t.taka}{payables.toLocaleString()}</span>
          <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-rose-400" />
        </div>
      </button>
    </div>

    <div className="space-y-4 pt-4">
      <div className="flex items-center gap-2 px-1">
        <History size={20} className="text-indigo-500" />
        <h3 className="font-bold text-slate-800 dark:text-slate-200">{t.recentTransactions}</h3>
      </div>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px]">{t.noData}</div>
        ) : (
          transactions.map((tr: Transaction) => (
            <div key={tr.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800 flex items-center justify-between group transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tr.type === 'INCOME' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-100 dark:bg-rose-900/20 text-rose-600'}`}>
                  {tr.type === 'INCOME' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{tr.category}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{format(parseISO(tr.date), 'dd MMM, hh:mm a')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-bold ${tr.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {tr.type === 'INCOME' ? '+' : '-'}{t.taka}{tr.amount.toLocaleString()}
                </span>
                <button onClick={() => onDeleteTransaction(tr.id)} className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

const FilteredTransactionsView = ({ t, transactions, type, onDelete, onCancel }: any) => {
  const sorted = [...transactions].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h3 className="text-xl font-bold dark:text-white">{type === 'INCOME' ? t.incomeList : t.expenseList}</h3><button type="button" onClick={onCancel} className="text-slate-400"><X /></button></div>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
        {sorted.length === 0 ? <div className="text-center py-10 text-slate-400">{t.noData}</div> : sorted.map((tr: Transaction) => (
          <div key={tr.id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center group">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tr.type === 'INCOME' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-100 dark:bg-rose-900/20 text-rose-600'}`}>
                {tr.type === 'INCOME' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200">{tr.category}</h4>
                <p className="text-[10px] text-slate-400">{format(parseISO(tr.date), 'dd MMM yyyy, hh:mm a')}</p>
                {tr.description && <p className="text-xs text-slate-500 mt-1 italic">"{tr.description}"</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-bold ${tr.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>{tr.type === 'INCOME' ? '+' : '-'}{t.taka}{tr.amount.toLocaleString()}</span>
              <button onClick={() => onDelete(tr.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onCancel} className="w-full bg-slate-900 dark:bg-slate-800 text-white py-4 rounded-2xl font-bold">{t.confirm}</button>
    </div>
  );
};

const SavingsView = ({ savings, total, t, onDelete }: any) => (
  <div className="p-6 space-y-6">
    <div className="bg-amber-500 dark:bg-amber-600 rounded-[32px] p-8 text-white shadow-xl flex flex-col items-center">
      <Landmark size={56} className="mb-4 text-white/90" />
      <p className="text-white/80 text-sm font-bold uppercase tracking-widest">{t.totalSavings}</p>
      <h2 className="text-4xl font-black mt-2">{t.taka}{total.toLocaleString()}</h2>
    </div>
    <div className="space-y-4">
      <h3 className="font-bold text-slate-800 dark:text-white text-lg">{t.history}</h3>
      {savings.length === 0 ? <div className="text-center py-12 text-slate-400">{t.noData}</div> : savings.map((s: Saving) => (
        <div key={s.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-50 dark:border-slate-800 flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.type === 'ADD' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}><Landmark size={20} /></div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200">{s.description || (s.type === 'ADD' ? '+' : '-')}</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500">{format(parseISO(s.date), 'dd MMM yyyy, hh:mm a')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`font-bold ${s.type === 'ADD' ? 'text-emerald-600' : 'text-rose-600'}`}>{s.type === 'ADD' ? '+' : '-'}{t.taka}{s.amount.toLocaleString()}</span>
            <button onClick={() => onDelete(s.id)} className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DebtsView = ({ parties, balances, filter, onFilter, onPartyClick, onAddParty, t }: any) => {
  const filteredParties = parties.filter((name: string) => {
    if (filter === 'ALL') return true;
    return balances[name]?.type === filter;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-white">{t.parties}</h2>
        <button onClick={onAddParty} className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl active:scale-95 transition-transform"><UserPlus size={22} /></button>
      </div>
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <button onClick={() => onFilter('ALL')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'ALL' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>{t.history}</button>
        <button onClick={() => onFilter('RECEIVABLE')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'RECEIVABLE' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>{t.iWillGet}</button>
        <button onClick={() => onFilter('PAYABLE')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'PAYABLE' ? 'bg-white dark:bg-slate-700 shadow-sm text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>{t.theyWillGet}</button>
      </div>
      <div className="space-y-4">
        {filteredParties.length === 0 ? <div className="text-center py-12 text-slate-400">{t.noData}</div> : filteredParties.map((name: string) => (
          <button key={name} onClick={() => onPartyClick(name)} className="w-full bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-50 dark:border-slate-800 flex items-center justify-between group active:scale-[0.98] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/10 group-hover:text-indigo-600 transition-colors"><User size={24} /></div>
              <div className="text-left">
                <h4 className="font-bold text-slate-800 dark:text-slate-100">{name}</h4>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${balances[name]?.type === 'RECEIVABLE' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {balances[name]?.type === 'RECEIVABLE' ? t.iWillGet : t.theyWillGet}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-black text-lg ${balances[name]?.type === 'RECEIVABLE' ? 'text-emerald-600' : 'text-rose-500'}`}>
                {t.taka}{(balances[name]?.total || 0).toLocaleString()}
              </span>
              <ArrowRight size={18} className="text-slate-300 dark:text-slate-600" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const ProfileView = ({ profile, settings, t, onUpdateProfile, onLang, onTheme, onDev, onExport, onImport }: any) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = () => { onUpdateProfile({ ...profile, name, email }); setEditing(false); };

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col items-center">
        <div className="relative group mb-4">
          <Avatar src={profile.avatar} size="w-28 h-28" iconSize={40} className="rounded-[36px]" />
          <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-2xl border-4 border-slate-50 dark:border-slate-950 shadow-lg active:scale-90 transition-transform"><Camera size={18} /></button>
          <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={(e: any) => {
            const f = e.target.files[0];
            if (f) {
              const r = new FileReader();
              r.onloadend = () => onUpdateProfile({ ...profile, avatar: r.result as string });
              r.readAsDataURL(f);
            }
          }} />
        </div>
        {editing ? (
          <div className="w-full space-y-3">
            <input value={name} onChange={e => setName(e.target.value)} className="w-full text-center font-bold text-xl bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-3" />
            <input value={email} onChange={e => setEmail(e.target.value)} className="w-full text-center text-slate-500 text-sm bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-3" />
            <div className="flex gap-2 justify-center"><button onClick={save} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">{t.save}</button><button onClick={() => setEditing(false)} className="px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">{t.cancel}</button></div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-black">{profile.name}</h2>
            <p className="text-slate-500 text-sm mb-4">{profile.email}</p>
            <button onClick={() => setEditing(true)} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border border-indigo-100 dark:border-indigo-900 px-5 py-2 rounded-full">Edit Profile</button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest ml-1">{t.settings}</h3>
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 overflow-hidden">
          <MenuBtn icon={<Languages size={18} />} label={t.language} sub={settings.language === 'bn' ? 'বাংলা' : 'English'} onClick={onLang} />
          <MenuBtn icon={settings.theme === 'light' ? <Sun size={18} /> : <Moon size={18} />} label={t.theme} sub={settings.theme === 'light' ? t.light : t.dark} onClick={onTheme} border />
        </div>

        <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest ml-1 mt-6">{t.backup}</h3>
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 overflow-hidden">
          <MenuBtn icon={<Database size={18} />} label={t.fullBackup} onClick={() => onExport('all')} />
          <label className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-t dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><Upload size={18} /></div>
            <span className="font-bold text-sm">{t.fullRestore}</span>
            <input type="file" className="hidden" accept=".json" onChange={(e: any) => onImport(e)} />
          </label>
        </div>

        <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest ml-1 mt-6">{t.selectiveBackup}</h3>
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 overflow-hidden">
          <MenuBtn icon={<FileJson size={18} className="text-emerald-500" />} label={t.transactionsBackup} onClick={() => onExport('transactions')} />
          <MenuBtn icon={<FileJson size={18} className="text-amber-500" />} label={t.savingsBackup} onClick={() => onExport('savings')} border />
          <MenuBtn icon={<FileJson size={18} className="text-rose-500" />} label={t.debtsBackup} onClick={() => onExport('debts')} border />
        </div>

        <MenuBtn icon={<Info size={18} />} label={t.developerInfo} onClick={onDev} border={false} className="mt-4 bg-white dark:bg-slate-900 rounded-[32px] border dark:border-slate-800" />
      </div>
    </div>
  );
};

const MenuBtn = ({ icon, label, sub, onClick, border, className = "" }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${border ? 'border-t dark:border-slate-800' : ''} ${className}`}>
    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">{icon}</div>
    <div className="flex-1 text-left"><p className="font-bold text-sm">{label}</p>{sub && <p className="text-[10px] text-slate-400">{sub}</p>}</div>
  </button>
);

const FormTransaction = ({ onSubmit, onCancel, t, date: initialDate }: any) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(initialDate);

  const sub = (e: any) => {
    e.preventDefault();
    if (!amount || !category) return;
    onSubmit({ type, amount: parseFloat(amount), category, description: desc, date: new Date(date).toISOString() });
  };

  return (
    <form onSubmit={sub} className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="text-xl font-bold dark:text-white">{t.addTransaction}</h3><button type="button" onClick={onCancel} className="text-slate-400"><X /></button></div>
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <button type="button" onClick={() => setType('EXPENSE')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${type === 'EXPENSE' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-500'}`}>{t.expense}</button>
        <button type="button" onClick={() => setType('INCOME')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${type === 'INCOME' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-500'}`}>{t.income}</button>
      </div>
      <div className="space-y-3">
        <input required type="number" placeholder={t.amount} value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl font-black text-xl outline-none ring-indigo-500 focus:ring-2" />
        <input required type="text" placeholder={t.category} value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none ring-indigo-500 focus:ring-2" />
        <div className="space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase ml-1">{t.dateTime}</p>
          <input required type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none ring-indigo-500 focus:ring-2 text-sm" />
        </div>
        <textarea placeholder={t.description} value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none ring-indigo-500 focus:ring-2 h-24" />
      </div>
      <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none">{t.confirm}</button>
    </form>
  );
};

const FormSaving = ({ onSubmit, onCancel, t, date: initialDate }: any) => {
  const [type, setType] = useState<'ADD' | 'SUBTRACT'>('ADD');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(initialDate);

  const sub = (e: any) => { e.preventDefault(); if (!amount) return; onSubmit({ type, amount: parseFloat(amount), description: desc, date: new Date(date).toISOString() }); };

  return (
    <form onSubmit={sub} className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="text-xl font-bold dark:text-white">{t.addSaving}</h3><button type="button" onClick={onCancel} className="text-slate-400"><X /></button></div>
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <button type="button" onClick={() => setType('ADD')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${type === 'ADD' ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm' : 'text-slate-500'}`}>{t.save}</button>
        <button type="button" onClick={() => setType('SUBTRACT')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${type === 'SUBTRACT' ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm' : 'text-slate-500'}`}>{t.resolve}</button>
      </div>
      <div className="space-y-3">
        <input required type="number" placeholder={t.amount} value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl font-black text-xl outline-none ring-amber-500 focus:ring-2" />
        <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm" />
        <input type="text" placeholder={t.description} value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl" />
      </div>
      <button type="submit" className="w-full bg-amber-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-amber-200 dark:shadow-none">{t.save}</button>
    </form>
  );
};

const FormDebt = ({ onSubmit, onCancel, t, date: initialDate, parties }: any) => {
  const [type, setType] = useState<'RECEIVABLE' | 'PAYABLE'>('RECEIVABLE');
  const [action, setAction] = useState<DebtActionType>('TAKEN');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(initialDate);

  const sub = (e: any) => { e.preventDefault(); if (!amount || !name) return; onSubmit({ type, personName: name, amount: parseFloat(amount), description: desc, date: new Date(date).toISOString(), actionType: action }); };

  return (
    <form onSubmit={sub} className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="text-xl font-bold dark:text-white">{t.addDebt}</h3><button type="button" onClick={onCancel} className="text-slate-400"><X /></button></div>
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <button type="button" onClick={() => setType('RECEIVABLE')} className={`py-2 rounded-xl text-xs font-bold ${type === 'RECEIVABLE' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500'}`}>{t.iWillGet}</button>
        <button type="button" onClick={() => setType('PAYABLE')} className={`py-2 rounded-xl text-xs font-bold ${type === 'PAYABLE' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-500'}`}>{t.theyWillGet}</button>
      </div>
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <button type="button" onClick={() => setAction('TAKEN')} className={`py-2 rounded-xl text-xs font-bold ${action === 'TAKEN' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{t.taken}</button>
        <button type="button" onClick={() => setAction('REPAID')} className={`py-2 rounded-xl text-xs font-bold ${action === 'REPAID' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{t.repaid}</button>
      </div>
      <div className="space-y-3">
        <div className="relative">
          <select value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl font-bold outline-none appearance-none">
            <option value="">{t.selectPerson}</option>
            {parties.map((p: string) => <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronRight size={18} className="rotate-90" /></div>
        </div>
        <input required type="number" placeholder={t.amount} value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl font-black text-xl outline-none" />
        <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm" />
        <textarea placeholder={t.description} value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl h-20" />
      </div>
      <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold">{t.confirm}</button>
    </form>
  );
};

const FormAddParty = ({ onSubmit, onCancel, t }: any) => {
    const [name, setName] = useState('');
    return (
        <form onSubmit={(e) => { e.preventDefault(); if (name) onSubmit(name); }} className="space-y-6">
            <div className="flex justify-between items-center"><h3 className="text-xl font-bold dark:text-white">{t.addNewPerson}</h3><button type="button" onClick={onCancel} className="text-slate-400"><X /></button></div>
            <input autoFocus required type="text" placeholder={t.personName} value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-5 rounded-[24px] font-bold text-xl outline-none ring-indigo-500 focus:ring-2 dark:text-white" />
            <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-bold shadow-lg shadow-indigo-200 dark:shadow-none">{t.save}</button>
        </form>
    );
};

const PartyDetail = ({ name, history, onDelete, onCancel, t }: any) => {
    const sorted = [...history].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center"><h3 className="text-xl font-bold dark:text-white">{name} - {t.history}</h3><button type="button" onClick={onCancel} className="text-slate-400"><X /></button></div>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
                {sorted.length === 0 ? <div className="text-center py-10 text-slate-400">{t.noData}</div> : sorted.map((d: Debt) => (
                    <div key={d.id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center group">
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${d.actionType === 'TAKEN' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {d.actionType === 'TAKEN' ? t.taken : t.repaid}
                            </p>
                            <p className="font-bold dark:text-white">{t.taka}{d.amount.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400">{format(parseISO(d.date), 'dd MMM yyyy, hh:mm a')}</p>
                            {d.description && <p className="text-xs text-slate-500 mt-1 italic">"{d.description}"</p>}
                        </div>
                        <button onClick={() => onDelete(d.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                    </div>
                ))}
            </div>
            <button onClick={onCancel} className="w-full bg-slate-900 dark:bg-slate-800 text-white py-4 rounded-2xl font-bold">{t.cancel}</button>
        </div>
    );
};

const DevProfile = ({ t, onCancel }: any) => (
  <div className="space-y-6 text-center">
    <div className="flex justify-between items-center"><h3 className="text-xl font-bold dark:text-white">{t.developerInfo}</h3><button type="button" onClick={onCancel} className="text-slate-400"><X /></button></div>
    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[32px] border dark:border-slate-700">
      <div className="w-24 h-24 bg-white dark:bg-slate-900 p-1 rounded-[32px] mx-auto mb-4 flex items-center justify-center shadow-md"><User size={48} className="text-slate-300" /></div>
      <h4 className="text-xl font-black">মো: শরিফুল ইসলাম</h4>
      <p className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mt-1 mb-6">Non Professional Developer</p>
      <div className="space-y-3 text-left">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800"><p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Email</p><a href="mailto:connect.shariful@gmail.com" className="text-sm font-bold">connect.shariful@gmail.com</a></div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800"><p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Facebook</p><a href="https://Fb.com/shariful.uxd" target="_blank" className="text-sm font-bold">Fb.com/shariful.uxd</a></div>
      </div>
    </div>
    <button onClick={onCancel} className="w-full bg-slate-900 dark:bg-slate-800 text-white py-4 rounded-2xl font-bold">{t.confirm}</button>
  </div>
);

const MonthlySummaryList = ({ history, onSelect, onCancel, t }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center font-bold text-xl dark:text-white"><h3>{t.history}</h3><button onClick={onCancel}><X /></button></div>
    <div className="space-y-3">
      {history.length === 0 ? <div className="text-center py-10 text-slate-400">{t.noData}</div> : history.map((h: any) => (
        <button key={format(h.date, 'yyyy-MM')} onClick={() => onSelect(h.date)} className="w-full bg-slate-50 dark:bg-slate-800 p-5 rounded-3xl text-left hover:border-indigo-400 border border-transparent transition-all group">
            <div className="flex justify-between mb-3"><span className="font-bold text-lg dark:text-white group-hover:text-indigo-600">{format(h.date, 'MMMM yyyy')}</span><ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-400" /></div>
            <div className="grid grid-cols-2 gap-4"><div className="text-xs font-medium"><p className="text-slate-400 uppercase tracking-widest mb-1">{t.income}</p><p className="text-emerald-600 dark:text-emerald-500 font-bold">{t.taka}{h.income.toLocaleString()}</p></div><div className="text-xs font-medium"><p className="text-slate-400 uppercase tracking-widest mb-1">{t.expense}</p><p className="text-rose-500 dark:text-rose-400 font-bold">{t.taka}{h.expense.toLocaleString()}</p></div></div>
        </button>
      ))}
    </div>
  </div>
);

export default App;