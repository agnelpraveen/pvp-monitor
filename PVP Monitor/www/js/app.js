//Code for Dashboard
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
		//app.receivedEvent('deviceready');
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {		
		try {		
			setupResponsiveUIConfig();
		
			appSetup();
			
			setupLogin();		
			
		} catch(err) {
			alert('Error' + err);
		}
    }
};

function setupLogin() {
	$('#loginForm').on('submit', function(e){
		var username = $('#usernameTB').val(), password = $('#passwordTB').val();
		
		e.preventDefault();
		
		$.ajax({
			url:'http://agnelpraveen.freeoda.com/validateuser.php',
			type:'POST',		   
			crossDomain: true,
			dataType: 'json',
			data:{ username: username, password: password },
			success:function(data){
				if(data.error) {
					alert('Invalid username or password.');
				} else {
					window.pvpuser = data;
					
					$('#viewContainer').removeClass('hidden');
					
					
					
					$('#main-nav a.active').removeClass('active');
					
					$('#dashboardLink').addClass('active');
					
					
					$('#currUsername').text(pvpuser.name);					
					
					if(pvpuser.role == "PanjayathAdmin") {
						$('#selectPanjayathsMenu').addClass('hidden');
						$('#panjayathViewFooter').removeClass('hidden');
						
						$('#loansLink').parent().removeClass('hidden');
						$('#shgsLink').parent().removeClass('hidden');
						
						showPanjayathView(pvpuser.panjayathname);
					} else {
						$('#panjayathViewFooter').addClass('hidden');
						$('#selectPanjayathsMenu').removeClass('hidden');
						
						$('#loansLink').parent().addClass('hidden');
						$('#shgsLink').parent().addClass('hidden');
						getAllPanjayathsData();
					}
				}
			}
		});
		
		return false;
	});
	
	$('#logoutLink').on('click', function(e) {
		e.preventDefault();
		
		$('#details-table').DataTable().destroy();
		$('#plf-loan-details-table').DataTable().destroy();
		
		$('#viewContainer').addClass('hidden');
		$('#loginView').removeClass("hidden");
				
		$('#passwordTB').val('');
		
		return false;
	});
	
	$('#dashboardLink').on('click', function(){
		$('#main-nav a.active').removeClass('active');
					
		$(this).addClass('active');
		
		$('#dashboardView, #dashboardActionLinks').removeClass('hidden');
		$('#loansView, #loansActionLinks').addClass('hidden');
		
	});
	
	$('#loansLink').on('click', function(){
		$('#main-nav a.active').removeClass('active');
					
		$(this).addClass('active');
		
		$('#dashboardView, #dashboardActionLinks').addClass('hidden');
		$('#loansView, #loansActionLinks').removeClass('hidden');
	});
}

function getAllPanjayathsData() {	
	window.panjayathLoanData = [];
	
	$.getJSON('http://agnelpraveen.freeoda.com/loandata/panjayaths.json', populateDashboardWithPanjayathsData, function(){
		alert("Error Loading Data");
	});
}

function populateDashboardWithPanjayathsData(data) {
	var panjayaths = data.panjayaths, panjayathIndex = 0, panjayathsCount = panjayaths.length, panjayath = undefined,			 
		totalPendingAmount = 0, totalPendingInstallments = 0, totalRepaymentAmount = 0, totalRepaymentAmountPaid = 0,
		detailsTableBody = '', $sideMenu = $('#side-menu');
		
	$('#panjayath-info').text('All Panjayaths');
	$('#selectPanjayathsMenu').removeClass('hidden');	
	$('#all-panjayaths-container').removeClass('hidden');
	$('#selected-panjayath-container').addClass('hidden');
	
	while(panjayathIndex < panjayathsCount) {
		panjayath = panjayaths[panjayathIndex];
		$sideMenu.append('<li><a href="#" data-panjayath="' + panjayath.name + '"><i class="fa fa-dashboard fa-fw"></i> ' + panjayath.name + '</a></li>');
		
		totalPendingAmount += panjayath.totalRepayableAmountPending;
		totalPendingInstallments += panjayath.totalPendingInstallments;
		totalRepaymentAmount += panjayath.totalRepayableAmount;
		totalRepaymentAmountPaid += panjayath.totalRepaymentAmountPaid;
		
		detailsTableBody += '<tr data-panjayath="' + panjayath.name + '" class="'+ ((panjayathIndex % 2 == 0)? 'even' : 'odd') +'"><td>' + panjayath.name +
							'</td><td>' + panjayath.cluster +
							'</td><td>' + panjayath.block + 
							'</td><td class="text-right">' + panjayath.totalNoOfRepaymentPendingSHGs +
							'</td><td class="text-right"><span class="fa fa-rupee"></span> ' + commaSeparateNumber(Math.round(panjayath.totalRepayableAmountPending)) +
							'</td><td class="text-right">' + panjayath.lastUpdatedDate + ' - ' + panjayath.lastUpdatedTime + '</td></tr>';
		
		panjayathIndex++;
	}
	
	$('#totalPendingAmount').html('<span class="fa fa-rupee"></span> ' + commaSeparateNumber(Math.round(totalPendingAmount)));
	$('#totalPendingInstallments').html(Math.round(totalPendingInstallments));
	$('#totalRepaymentAmount').html('<span class="fa fa-rupee"></span> ' + commaSeparateNumber(Math.round(totalRepaymentAmount)));
	$('#totalRepaymentAmountPaid').html('<span class="fa fa-rupee"></span> ' + commaSeparateNumber(Math.round(totalRepaymentAmountPaid)));
	
	$('#details-table-body').html(detailsTableBody).on('click', 'tr', function(){
		var selectedPanjayath = $(this).data('panjayath');
		$('a[data-panjayath="'+ selectedPanjayath +'"]', $sideMenu).click();
	});	
	
	$('#details-table').DataTable({
		responsive: true
	});
	
	$('#loginView').addClass('hidden');
	$('#dashboardView').removeClass("hidden");
		
	$sideMenu.metisMenu().on('click', 'a', function(e){
		var selectedPanjayath = $(this).data('panjayath');
		e.preventDefault();
		
		$('a.active', $sideMenu).removeClass('active');
		$('a[data-panjayath="'+ selectedPanjayath +'"]', $sideMenu).addClass('active');
		
		if(selectedPanjayath == "All") {
			$('#panjayath-info').text('All Panjayaths');
			$('#selected-panjayath-container').addClass('hidden');
			$('#all-panjayaths-container').removeClass('hidden');			
		} else {			
			showPanjayathView(selectedPanjayath);
		}
		
		return false;
	});
}

function showPanjayathView(selectedPanjayath) {
	$.getJSON('http://agnelpraveen.freeoda.com/loandata/data/' + selectedPanjayath + '.json', function(data){
		var plfLoans = data.PLFLoans, plfLoanIndex = 0, plfLoan = undefined, shgName = undefined;
			nameOfSHGs = [], plfLoanDetails = [], nameOfSHGIndex = 0, existingLoanDetail = undefined, loanDetail = undefined
			loanDetailsTableData = [];			
		
		$('#panjayath-info').text(selectedPanjayath);
		$('#all-panjayaths-container').addClass('hidden');
		$('#selected-panjayath-container').removeClass('hidden');
		
		$('#panjayathTotalPendingAmount').html('<span class="fa fa-rupee"></span> ' + commaSeparateNumber(Math.round(data.TotalRepayableAmountPending)));
		$('#panjayathTotalPendingInstallments').html(Math.round(data.TotalPendingInstallments));
		$('#panjayathTotalRepaymentAmount').html('<span class="fa fa-rupee"></span> ' + commaSeparateNumber(Math.round(data.TotalRepayableAmount)));
		$('#panjayathTotalRepaymentAmountPaid').html('<span class="fa fa-rupee"></span> ' + commaSeparateNumber(Math.round(data.TotalRepaymentAmountPaid)));
		
		while(plfLoanIndex < plfLoans.length) {
			plfLoan = plfLoans[plfLoanIndex];
			shgName = plfLoan.NameOfApplicant;
			
			existingLoanDetail = plfLoanDetails[shgName];
			
			if(existingLoanDetail) {
				existingLoanDetail.noOfPLFLoans++;
				existingLoanDetail.approvedAmount += plfLoan.LoanApprovedAmount;
				existingLoanDetail.paidAmount += plfLoan.TotalRepaymentAmountPaid;
				existingLoanDetail.pendingInstallments += plfLoan.TotalPendingInstallments;
				existingLoanDetail.pendingAmount +=	plfLoan.TotalPendingAmount;
				existingLoanDetail.remainingInstallments +=	plfLoan.RemainingInstallments;	
			} else {
				nameOfSHGs.push(shgName);
				plfLoanDetails[shgName] = { nameOfSHG: shgName,
											noOfPLFLoans: 1,
											approvedAmount: plfLoan.LoanApprovedAmount,
											paidAmount: plfLoan.TotalRepaymentAmountPaid,
											pendingInstallments: plfLoan.TotalPendingInstallments,
											pendingAmount: plfLoan.TotalPendingAmount,
											remainingInstallments: plfLoan.RemainingInstallments };
			}
			
				
			plfLoanIndex++;
		}
		
		while(nameOfSHGIndex < nameOfSHGs.length) {
			loanDetail = plfLoanDetails[nameOfSHGs[nameOfSHGIndex]];
			
			loanDetailsTableData.push([loanDetail.nameOfSHG,
									   loanDetail.noOfPLFLoans,
									   '<span class="fa fa-rupee"></span> ' + commaSeparateNumber(Math.round(loanDetail.approvedAmount)),
									   '<span class="fa fa-rupee"></span> ' + commaSeparateNumber(Math.round(loanDetail.paidAmount)),
									   commaSeparateNumber(Math.round(loanDetail.pendingInstallments)),
									   '<span class="fa fa-rupee"></span> ' + commaSeparateNumber(Math.round(loanDetail.pendingAmount)),
									   commaSeparateNumber(Math.round(loanDetail.remainingInstallments))]);
			
			nameOfSHGIndex++;
		}			
		
		/*$('#plf-loan-details-table-body').html(loanDetailsTableBody).on('click', 'tr', function(){
			var selectedSHG = $(this).data('shgLeader');
			console.log(selectedSHG);
		});*/
		
		$('#plf-loan-details-table').DataTable({ responsive: true, destroy:true, data:loanDetailsTableData,
												 "rowCallback": function( row, data, index ) {
													var pendingInstallments = data[4];
													if (pendingInstallments > 2) {
														$(row).addClass('danger');
													} else if(pendingInstallments >= 1) {
														$(row).addClass('warning');
													}
												 }
		});
	
		$('#loginView').addClass('hidden');
		$('#dashboardView').removeClass("hidden");
		
	}, function(){
		alert("Error Loading Data");
	});
}

function commaSeparateNumber(val){
    var x = val.toString();
	var afterPoint = '';
	if(x.indexOf('.') > 0)
	   afterPoint = x.substring(x.indexOf('.'),x.length);
	x = Math.floor(x);
	x = x.toString();
	var lastThree = x.substring(x.length-3);
	var otherNumbers = x.substring(0,x.length-3);
	if(otherNumbers != '')
		lastThree = ',' + lastThree;
	var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
    return res;
}

function appSetup(){
	$(document).ajaxStart(function () {//Global AJAX setup for managing loading and error info  
		$("#error-info").hide();
		$("#loading-overlay, #loading-info").show();
	})
	.ajaxStop(function () {
		$("#loading-overlay, #loading-info").hide();
	})
	.ajaxError(function (event, jqxhr, settings, thrownError) {
		$("#loading-overlay, #loading-info").hide();
		$("#error-info").show();
		console.log(jqxhr);
		console.log(thrownError);
	});
}

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
function setupResponsiveUIConfig() {
	$(window).bind("load resize", function() {
        topOffset = 50;
        width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });

    var url = window.location;
    var element = $('ul.nav a').filter(function() {
        return this.href == url || url.href.indexOf(this.href) == 0;
    }).addClass('active').parent().parent().addClass('in').parent();
    if (element.is('li')) {
        element.addClass('active');
    }
}