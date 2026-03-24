let accounts = JSON.parse(localStorage.getItem('accounts'))||[];
let transactions = JSON.parse(localStorage.getItem('transactions'))||[];

function saveData(){ 
  localStorage.setItem('accounts', JSON.stringify(accounts));
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

const navButtons = document.querySelectorAll('.nav button');
const viewTitle = document.getElementById('view-title');
const viewContainer = document.getElementById('view-container');
const templates = {};
document.querySelectorAll('template').forEach(t=>templates[t.id.replace('tpl-','')]=t);

function setActiveView(view){
  navButtons.forEach(b=>b.classList.toggle('active', b.dataset.view===view));
  viewTitle.textContent = view.charAt(0).toUpperCase() + view.slice(1);
  renderView(view);
}

navButtons.forEach(b=>b.addEventListener('click', ()=> setActiveView(b.dataset.view)));

function renderView(view){
  viewContainer.innerHTML='';
  const tpl=templates[view];
  if(!tpl){ viewContainer.textContent='Not Available'; return; }
  viewContainer.appendChild(tpl.content.cloneNode(true));
  if(view==='dashboard') renderDashboard();
  if(view==='add') bindAdd();
  if(view==='deposit') bindDeposit();
  if(view==='withdraw') bindWithdraw();
  if(view==='transfer') bindTransfer();
  if(view==='list') bindList();
  if(view==='transactions') renderTransactions();
}

// Dashboard
function renderDashboard(){
  document.getElementById('stat-total').textContent = accounts.length;
  const totalBal = accounts.reduce((sum,a)=>sum+(a.balance||0),0);
  document.getElementById('stat-balance').textContent = totalBal;
  document.getElementById('stat-trans').textContent = transactions.length;
}

// Add Account
function bindAdd(){
  const form=document.getElementById('addForm');
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const name=form.name.value.trim();
    const acc=form.acc.value.trim();
    if(accounts.find(a=>a.acc==acc)){ alert('Account already exists'); return;}
    accounts.push({name,acc,balance:0});
    saveData(); alert('Account created'); form.reset(); renderDashboard();
  });
}

// Deposit
function bindDeposit(){
  const form=document.getElementById('depositForm');
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const acc=form.acc.value.trim();
    const amt=parseFloat(form.amount.value);
    const account=accounts.find(a=>a.acc==acc);
    if(!account){ alert('Account not found'); return;}
    if(amt<=0){ alert('Invalid amount'); return;}
    account.balance += amt;
    transactions.push({date:new Date().toLocaleString(),acc,type:'Deposit',amount:amt,balance:account.balance});
    saveData(); alert('Deposit successful'); form.reset(); renderDashboard();
  });
}

// Withdraw
function bindWithdraw(){
  const form=document.getElementById('withdrawForm');
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const acc=form.acc.value.trim();
    const amt=parseFloat(form.amount.value);
    const account=accounts.find(a=>a.acc==acc);
    if(!account){ alert('Account not found'); return;}
    if(amt<=0 || amt>account.balance){ alert('Invalid amount or insufficient balance'); return;}
    account.balance -= amt;
    transactions.push({date:new Date().toLocaleString(),acc,type:'Withdraw',amount:amt,balance:account.balance});
    saveData(); alert('Withdrawal successful'); form.reset(); renderDashboard();
  });
}

// Transfer
function bindTransfer(){
  const form=document.getElementById('transferForm');
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const from=form.from.value.trim();
    const to=form.to.value.trim();
    const amt=parseFloat(form.amount.value);
    const accFrom=accounts.find(a=>a.acc==from);
    const accTo=accounts.find(a=>a.acc==to);
    if(!accFrom || !accTo){ alert('Account not found'); return;}
    if(amt<=0 || amt>accFrom.balance){ alert('Invalid amount or insufficient balance'); return;}
    accFrom.balance -= amt;
    accTo.balance += amt;
    transactions.push({date:new Date().toLocaleString(),acc:from,type:'Transfer Out',amount:amt,balance:accFrom.balance});
    transactions.push({date:new Date().toLocaleString(),acc:to,type:'Transfer In',amount:amt,balance:accTo.balance});
    saveData(); alert('Transfer successful'); form.reset(); renderDashboard();
  });
}

// List Accounts
function bindList(){
  const tbody=document.getElementById('accountTable');
  const searchInput=document.getElementById('searchAcc');
  function renderList(){
    tbody.innerHTML='';
    const filter = searchInput.value.toLowerCase();
    accounts.filter(a=>a.acc.includes(filter)||a.name.toLowerCase().includes(filter)).forEach(a=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${a.name}</td><td>${a.acc}</td><td>${a.balance}</td>`;
      tbody.appendChild(tr);
    });
  }
  searchInput.addEventListener('input', renderList);
  renderList();
}

// Transactions Table
function renderTransactions(){
  const tbody=document.getElementById('tranTable');
  tbody.innerHTML='';
  transactions.forEach(t=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${t.date}</td><td>${t.acc}</td><td>${t.type}</td><td>${t.amount}</td><td>${t.balance}</td>`;
    tbody.appendChild(tr);
  });
}

setActiveView('dashboard');