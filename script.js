const $ = (id) => document.getElementById(id);

$('date').valueAsDate = new Date();
$('validUntil').valueAsDate = new Date();

function amount(id){
    const value = Number($(id).value);
    return Number.isFinite(value) && value > 0 ? value : 0;
}

function calculate(){
    const monthly = amount('monthlyFees');
    const external = amount('externalCharge');
    const pending = amount('pendingFees');
    const submitted = amount('submittedFees');
    const total = monthly + external + pending;
    const remaining = Math.max(total - submitted, 0);
    $('previewTotal').textContent = `₹ ${total.toFixed(2)}`;
    $('previewRemaining').textContent = `₹ ${remaining.toFixed(2)}`;
    return {monthly, external, pending, submitted, total, remaining};
}

['monthlyFees','externalCharge','pendingFees','submittedFees'].forEach(id => {
    $(id).addEventListener('input', calculate);
});

$('logoInput').addEventListener('change', function(){
    const file = this.files && this.files[0];
    if(!file) return;
    if(!file.type.startsWith('image/')){
        alert('Please select a valid image file for the logo.');
        this.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e){
        $('logoPreview').src = e.target.result;
        $('logoPreview').hidden = false;
        $('logoPlaceholder').style.display = 'none';
        $('slipLogo').src = e.target.result;
        $('slipLogoWrap').hidden = false;
    };
    reader.readAsDataURL(file);
});

function formatDate(value){
    if(!value) return '-';
    const d = new Date(value + 'T00:00:00');
    if(Number.isNaN(d.getTime())) return '-';
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function generateSlip(){
    const name = $('studentName').value.trim();
    const roll = $('rollNo').value.trim();
    const date = $('date').value;
    const validUntil = $('validUntil').value;
    const values = calculate();

    if(!name){ alert("Please enter student's name."); $('studentName').focus(); return; }
    if(!roll){ alert('Please enter roll number.'); $('rollNo').focus(); return; }
    if(!date){ alert('Please select payment date.'); $('date').focus(); return; }
    if(!validUntil){ alert('Please select Valid Until date.'); $('validUntil').focus(); return; }
    if(values.submitted > values.total){
        alert('Submitted Fees cannot be greater than Total Payable Amount.');
        $('submittedFees').focus();
        return;
    }

    $('showName').textContent = name;
    $('showRoll').textContent = roll;
    $('showDate').textContent = formatDate(date);
    $('showValidUntil').textContent = formatDate(validUntil);
    $('showMonthly').textContent = values.monthly.toFixed(2);
    $('showExternal').textContent = values.external.toFixed(2);
    $('showPending').textContent = values.pending.toFixed(2);
    $('showTotal').textContent = values.total.toFixed(2);
    $('showSubmitted').textContent = values.submitted.toFixed(2);
    $('showRemaining').textContent = values.remaining.toFixed(2);

    const status = $('paymentStatus');
    status.className = 'payment-status';
    if(values.total === 0){
        status.textContent = 'NO PAYMENT AMOUNT ENTERED';
    } else if(values.remaining === 0){
        status.textContent = 'FULLY PAID';
        status.classList.add('paid');
    } else {
        status.textContent = 'PARTIAL PAYMENT • PENDING FEES REMAIN';
        status.classList.add('partial');
    }

    $('feesSlip').style.display = 'block';
    $('printButton').style.display = 'block';
    $('feesSlip').scrollIntoView({behavior:'smooth', block:'start'});
}

function resetForm(){
    ['studentName','rollNo','monthlyFees','externalCharge','pendingFees','submittedFees'].forEach(id => $(id).value = '');
    $('date').valueAsDate = new Date();
    $('validUntil').valueAsDate = new Date();
    $('logoInput').value = '';
    $('logoPreview').src = '';
    $('logoPreview').hidden = true;
    $('logoPlaceholder').style.display = 'inline';
    $('slipLogoWrap').hidden = true;
    $('feesSlip').style.display = 'none';
    $('printButton').style.display = 'none';
    calculate();
}

calculate();
