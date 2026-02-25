// English translations
export default {
  // App
  app: {
    title: 'Gas Station Management',
  },

  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    reset: 'Reset',
    actions: 'Actions',
    status: 'Status',
    loading: 'Loading...',
    noData: 'No Data',
    success: 'Success',
    error: 'Failed',
    required: 'Required',
    optional: 'Optional',
    all: 'All',
    enabled: 'Enabled',
    disabled: 'Disabled',
    yes: 'Yes',
    no: 'No',
    back: 'Back',
    detail: 'Detail',
    export: 'Export',
    import: 'Import',
    pageNotFound: 'Sorry, the page you visited does not exist',
    backToHome: 'Back to Home',
    resetFilters: 'Reset Filters',
    stationUpdateSuccess: 'Station updated successfully',
    stationCreateSuccess: 'Station created successfully',
    submitFailed: 'Submit failed, please check the form',
    stationDisabled: 'Station has been disabled',
    viewSwitch: 'View Switch',
    tableView: 'Table View',
    cardView: 'Card View',
    prevStep: 'Previous',
    nextStep: 'Next',
    totalRecords: 'Total {{total}} records',
    refresh: 'Refresh',
    autoRefresh: 'Auto Refresh',
    view: 'View',
    total: 'Total',
    records: '',
    comingSoon: 'Coming soon',
    exportTodo: 'Export coming soon',
  },

  // Navigation menu
  menu: {
    operations: 'Operations',
    station: 'Station',
    shift: 'Shift',
    shiftOverview: 'Station Overview',
    shiftSchedule: 'Schedule',
    shiftHistory: 'History',
    shiftSettlementReview: 'Settlement Review',
    equipment: 'Equipment',
    inspection: 'Inspection Management',
    inspectionTasks: 'Inspection Tasks',
    inspectionPlans: 'Inspection Plans',
    inspectionCheckItems: 'Check Items',
    inspectionIssues: 'Issue Records',
    inspectionLogs: 'Inspection Logs',
    inspectionAnalytics: 'Analytics & Reports',
    deviceLedger: 'Device & Facility',
    facilityMonitoring: 'Facility Monitoring',
    equipmentLedger: 'Equipment Ledger',
    maintenanceOrders: 'Maintenance Orders',
    deviceConnectivity: 'Device Connectivity',
    energyTrade: 'Energy Trade',
    priceOverview: 'Price Overview',
    priceHistory: 'Adjustment History',
    priceBoard: 'Price Board',
    priceApproval: 'Price Approval',
    memberPrices: 'Member Prices',
    priceAgreements: 'Price Agreements',
    priceSettings: 'Price Settings',
  },

  // User identity
  user: {
    signOut: 'Sign Out',
    signOutConfirm: 'Are you sure to sign out?',
    signedOut: 'Signed out',
    role: {
      station_master: 'Station Master',
      shift_leader: 'Shift Leader',
      cashier: 'Cashier',
      finance: 'Finance',
    },
  },

  // Station management module
  station: {
    title: 'Station Management',
    list: 'Station List',
    detail: 'Station Detail',
    add: 'Add Station',
    edit: 'Edit Station',
    
    // Fields
    name: 'Station Name',
    code: 'Station Code',
    address: 'Address',
    longitude: 'Longitude',
    latitude: 'Latitude',
    contact: 'Contact',
    phone: 'Phone',
    businessHours: 'Business Hours',
    regionLabel: 'Region',
    groupLabel: 'Group',
    status: 'Status',
    
    // Status
    statusActive: 'Active',
    statusInactive: 'Inactive',
    statusMaintenance: 'Maintenance',
    
    // Actions
    switchStation: 'Switch Station',
    selectStation: 'Select Station',
    
    // Tabs
    tabBasic: 'Basic Info',
    tabNozzle: 'Nozzle Config',
    tabShift: 'Shift & Schedule',
    tabPhoto: 'Photos',
    tabEmployee: 'Employees',
    
    // Nozzle configuration
    nozzle: {
      title: 'Nozzle Configuration',
      list: 'Nozzle List',
      add: 'Add Nozzle',
      edit: 'Edit Nozzle',
      code: 'Nozzle Code',
      fuelType: 'Fuel Type',
      unitPrice: 'Unit Price',
      status: 'Status',
      setPrice: 'Set Price',
      enable: 'Enable',
      disable: 'Disable',
      statusOnline: 'Online',
      statusOffline: 'Offline',
      statusFueling: 'Fueling',
      statusFault: 'Fault',
      statusIdle: 'Idle',
      businessStatus: 'Business Status',
      dispenser: 'Dispenser',
    },
    
    // Device status
    device: {
      online: 'Online',
      offline: 'Offline',
      error: 'Fault',
    },
    
    // Employee
    employee: {
      no: 'Employee No',
      name: 'Name',
      phone: 'Phone',
      position: 'Position',
      source: 'Source',
      sourceSync: 'System Sync',
      sourceLocal: 'Local',
      syncModeSync: 'Sync from User Module',
      syncModeLocal: 'Local Maintenance',
      list: 'Employee List',
    },
    
    // Form
    form: {
      basicInfo: 'Basic Info',
      locationInfo: 'Location Info',
      contactAndBusiness: 'Contact & Business',
      confirmSubmit: 'Confirm Submit',
      stationCodeDesc: 'Station Name & Code',
      addressAndRegion: 'Address & Region',
      contactAndHours: 'Contact & Hours',
      infoPreview: 'Info Preview',
      codeModeAuto: 'Auto Generate',
      codeModeManual: 'Manual Input',
      autoGenerated: 'Auto Generated',
      weekdayHours: 'Weekday Hours',
      weekendHours: 'Weekend Hours',
      employeeSyncMode: 'Employee Sync Mode',
      confirmInfo: 'Confirm Info',
      coordinate: 'Coordinate',
      confirmLeave: 'Are you sure to leave? Unsaved data will be lost',
      nextStep: 'Next',
    },
    
    // Shift definitions
    shift: {
      title: 'Shifts',
      name: 'Shift Name',
      list: 'Shift List',
      add: 'Add Shift',
      startTime: 'Start Time',
      endTime: 'End Time',
      supervisor: 'Supervisor',
      definitionsTab: 'Shift Definitions',
      scheduleTab: 'Schedule Calendar',
    },

    // Schedule (weekly calendar)
    schedule: {
      title: 'Schedule',
      shift: 'Shift',
      date: 'Date',
      employee: 'Employee',
      addSchedule: 'Add Schedule',
      editSchedule: 'Edit Schedule',
      saveSuccess: 'Schedule saved successfully',
      thisWeek: 'This Week',
      prevWeek: 'Previous Week',
      nextWeek: 'Next Week',
    },

    // Station photos
    photo: {
      title: 'Station Photos',
      upload: 'Upload Photo',
    },

    // Detail page
    detailPage: {
      stationInfo: 'Station Info',
      overview: 'Statistics Overview',
      overnight: 'Overnight',
      nozzleConfig: 'Nozzle Config List',
      refreshStatus: 'Refresh Status',
      viewNozzleConfig: 'View Nozzle Config',
      errorNozzleAlert: 'This station has {{count}} nozzle(s) in fault status',
      confirmDisableStation: 'Are you sure to disable this station?',
      noPhoto: 'No Photos',
    },
  },

  // Fuel types
  fuelType: {
    gasoline92: '92# Gasoline',
    gasoline95: '95# Gasoline',
    gasoline98: '98# Gasoline',
    diesel: 'Diesel',
    cng: 'CNG',
    lng: 'LNG',
    other: 'Other',
  },

  // Shift Handover module
  shiftHandover: {
    // Page titles
    title: 'Shift Handover',
    summaryTitle: 'Shift Summary',
    historyTitle: 'Handover History',
    detailTitle: 'Handover Detail',
    wizardTitle: 'Handover Wizard',
    wizardSubtitle: 'Please complete the handover process step by step',
    settlementReviewTitle: 'Settlement Review',
    
    // Current shift
    currentShift: 'Current Shift',
    shiftTime: 'Shift Time',
    shiftDuration: 'Running',
    hoursUnit: 'hours',
    startHandover: 'Start Handover',
    viewHistory: 'View History',
    cashSettlement: 'Cash Settlement',
    settlementReview: 'Settlement Review',
    
    // Statistics
    totalAmount: 'Total Sales',
    totalOrders: 'Total Orders',
    ordersUnit: '',
    netAmount: 'Net Income',
    abnormalCount: 'Abnormal Count',
    refundCount: 'Refund Count',
    refundAmount: 'Refund Amount',
    fuelQuantity: 'Fuel Quantity',
    comparedToPrevious: 'vs Previous Shift',
    dataRefreshed: 'Data updated',
    refreshFailed: 'Refresh failed, please retry',
    lastUpdated: 'Last updated',
    seconds: 's',
    unsettledCash: 'Unsettled Cash',
    autoRefreshInterval: 'Auto Refresh Interval',
    
    // Amount display
    hideAmount: 'Hide Amount',
    showAmount: 'Show Amount',
    amountHidden: '****',
    
    // Payment methods
    byPaymentMethod: 'By Payment Method',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    wechat: 'WeChat Pay',
    alipay: 'Alipay',
    unionpay: 'UnionPay',
    prepaid: 'Prepaid Card',
    credit: 'Credit',
    other: 'Other',
    
    // Fuel types
    byFuelType: 'By Fuel Type',
    fuelType: 'Fuel Type',
    quantity: 'Quantity',
    amount: 'Amount',
    orders: 'Orders',
    
    // Handover history
    dateRange: 'Date Range',
    station: 'Station',
    shiftName: 'Shift',
    stationName: 'Station Name',
    shiftDate: 'Shift Date',
    handoverTime: 'Handover Time',
    handoverBy: 'Handover By',
    receivedBy: 'Received By',
    recordsUnit: '',
    viewDetail: 'View Detail',
    
    // Status
    initiated: 'Initiated',
    pendingReview: 'Pending Review',
    completed: 'Completed',
    cancelled: 'Cancelled',
    approved: 'Approved',
    rejected: 'Rejected',
    
    // Detail page
    recordNotFound: 'Record not found',
    basicInfo: 'Basic Info',
    handoverNo: 'Handover No.',
    salesSummary: 'Sales Summary',
    issueRecords: 'Issue Records',
    noIssues: 'No issues recorded',
    forcedHandover: 'Forced Handover',
    print: 'Print',
    remarks: 'Remarks',
    
    // Issues
    issueType: 'Issue Type',
    severity: 'Severity',
    description: 'Description',
    reportedBy: 'Reported By',
    resolved: 'Resolved',
    unresolved: 'Unresolved',
    
    // Cash settlement
    expectedAmount: 'Expected Amount',
    actualAmount: 'Actual Amount',
    difference: 'Difference',
    differenceReason: 'Difference Reason',
    differenceNote: 'Difference Note',
    settlementMethod: 'Settlement Method',
    settlementNo: 'Settlement No.',
    settlementTime: 'Settlement Time',
    settlementStatus: 'Settlement Status',
    submittedBy: 'Submitted By',
    reviewedBy: 'Reviewed By',
    reviewedAt: 'Reviewed At',
    
    // Difference types
    balanced: 'Balanced',
    overage: 'Over ¥{{amount}}',
    shortage: 'Short ¥{{amount}}',
    
    // Settlement methods
    methodCashBox: 'Cash Box',
    methodSafe: 'Safe',
    methodBank: 'Bank Deposit',
    
    // Wizard steps
    stepPrecheck: 'Pre-check',
    stepSummary: 'Summary',
    stepSettlement: 'Settlement',
    stepConfirm: 'Confirm',
    
    // Pre-check
    precheckTip: 'Please confirm the following items. Items marked with * are required.',
    checkAll: 'Check All',
    completeRequiredItems: 'Please complete all required items',
    
    // Settlement
    settlementTip: 'Please verify and enter the actual cash amount',
    enterActualAmount: 'Please enter actual amount',
    enterDifferenceReason: 'Difference exceeds 10, please explain',
    differenceReasonPlaceholder: 'Please explain the reason for difference',
    
    // Confirm
    confirmTip: 'Please confirm the handover information before submitting',
    shiftInfo: 'Shift Info',
    remarksPlaceholder: 'Enter any notes for the next shift',
    
    // Submit
    confirmSubmit: 'Confirm Submit',
    submitSuccess: 'Handover submitted successfully',
    submitFailed: 'Submit failed, please retry',
    cancelHandover: 'Cancel Handover',
    confirmCancel: 'Cancel handover?',
    cancelWarning: 'Data entered will be lost if you cancel',
    
    // Force handover
    forceHandover: 'Force Handover',
    forceHandoverTitle: 'Force Handover Confirmation',
    forceHandoverWarning: 'Pre-check items are not completed. Are you sure to force submit? This action will be logged.',
    confirmForce: 'Confirm Force Submit',
    
    // Complete
    handoverSuccess: 'Handover Completed',
    handoverSuccessTip: 'Handover has been submitted, waiting for confirmation',
    backToSummary: 'Back to Summary',
    
    // Review
    review: 'Review',
    reviewSettlement: 'Review Settlement',
    reviewResult: 'Review Result',
    approve: 'Approve',
    reject: 'Reject',
    reviewNote: 'Review Note',
    reviewNotePlaceholder: 'Optional review notes',
    enterRejectReason: 'Please enter rejection reason',
    rejectReasonPlaceholder: 'Please explain the rejection reason',
    submitReview: 'Submit Review',
    reviewApproveSuccess: 'Approved',
    reviewRejectSuccess: 'Rejected',
    
    // Statistics
    pendingReviewCount: 'Pending Review',
    totalDifferenceSum: 'Total Difference',

    // Receiver selection
    selectReceiver: 'Select Receiver',
    selectReceiverPlaceholder: 'Select the person taking over',
    receiverHint: 'Only employees in this station\'s schedule are shown. If you cannot find the person, go to "Station → Employees" to ensure they are added to the schedule.',
    receiverRequired: 'Please select a receiver',

    // Schedule
    scheduleTitle: 'Shift Schedule',
    scheduleThisWeek: 'This Week',
    scheduleThisMonth: 'This Month',
    schedulePrevWeek: 'Previous Week',
    scheduleNextWeek: 'Next Week',
    scheduleAddShift: 'Add Schedule',
    scheduleEditShift: 'Edit Schedule',
    scheduleDate: 'Date',
    scheduleShift: 'Shift',
    scheduleEmployee: 'Employee',
    scheduleSave: 'Save',
    scheduleSaveSuccess: 'Schedule saved successfully',
    scheduleNoData: 'No schedule data. Please create schedules first.',
    scheduleGoToSchedule: 'Go to Schedule',

    // Station overview
    overviewTitle: 'Station Overview',
    currentShiftInfo: 'Current Shift',
    nextShiftInfo: 'Next Shift',
    selectStation: 'Select Station',
    switchStation: 'Switch Station',
    noScheduleHint: 'No schedule info. Please create schedules first.',
    scheduled: 'Scheduled',
  },

  // Device & Facility Management
  deviceLedger: {
    monitoring: {
      title: 'Facility Monitoring',
      totalDevices: 'Total Devices',
      onlineRate: 'Online Rate',
      alarms: 'Alarms',
      pendingMaintenance: 'Pending Maintenance',
      tankSection: 'Tank Status',
      dispenserSection: 'Dispenser Status',
      pendingActions: 'Pending Actions',
      autoRefresh: 'Auto Refreshing',
      tankDetail: 'Tank Monitoring',
      dispenserDetail: 'Dispenser Status Board',
      level: 'Level',
      pressure: 'Pressure',
      temperature: 'Temperature',
      trend: 'Trend Chart',
    },
    equipment: {
      title: 'Equipment Ledger',
      add: 'Add Equipment',
      edit: 'Edit Equipment',
      create: 'Add Equipment',
      detail: 'Equipment Detail',
      deviceCode: 'Device Code',
      name: 'Name',
      type: 'Type',
      model: 'Model',
      status: 'Status',
      installDate: 'Install Date',
      nextMaintenance: 'Next Maintenance',
    },
    maintenance: {
      title: 'Maintenance Orders',
      report: 'Report Fault',
      createOrder: 'Create Maintenance Order',
      submit: 'Submit Order',
      orderNumber: 'Order No.',
      type: 'Type',
      device: 'Device',
      urgency: 'Urgency',
      status: 'Status',
      assignee: 'Assignee',
      createdAt: 'Created At',
      description: 'Description',
    },
    connectivity: {
      title: 'Device Connectivity',
    },
  },

  // Inspection Management Module
  inspection: {
    // Page titles
    title: 'Inspection Management',
    taskTitle: 'Inspection Tasks',
    planTitle: 'Inspection Plans',
    checkItemTitle: 'Check Items',
    issueTitle: 'Issue Records',
    logTitle: 'Inspection Logs',
    analyticsTitle: 'Analytics & Reports',

    // Plan status
    planStatus: {
      pending: 'Pending',
      active: 'Active',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },

    // Task status
    taskStatus: {
      pending: 'Pending',
      inProgress: 'In Progress',
      completed: 'Completed',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
    },

    // Check result
    checkResult: {
      normal: 'Normal',
      abnormal: 'Abnormal',
      skipped: 'Skipped',
      notChecked: 'Not Checked',
    },

    // Issue severity
    severity: {
      critical: 'Critical',
      major: 'Major',
      minor: 'Minor',
      suggestion: 'Suggestion',
    },

    // Issue status
    issueStatus: {
      pending: 'Pending',
      processing: 'Processing',
      pendingReview: 'Pending Review',
      resolved: 'Resolved',
      closed: 'Closed',
    },

    // Cycle type
    cycleType: {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      custom: 'Custom',
    },

    // Check item category
    category: {
      safety_equipment: 'Safety Equipment',
      fire_protection: 'Fire Protection',
      electrical: 'Electrical',
      pressure_vessel: 'Pressure Vessel',
      environmental: 'Environmental',
      general_facility: 'General Facility',
    },

    // Task list
    task: {
      totalTasks: 'Total Tasks',
      pendingTasks: 'Pending',
      overdueTasks: 'Overdue',
      todayCompleted: 'Today Completed',
      pendingIssues: 'Pending Issues',
      taskNo: 'Task No.',
      planName: 'Plan',
      assignee: 'Assignee',
      scheduledTime: 'Scheduled Time',
      deadlineTime: 'Deadline',
      completedAt: 'Completed At',
      progress: 'Progress',
      assign: 'Assign',
      assignTo: 'Assign To',
      selectAssignee: 'Select Assignee',
      assignSuccess: 'Assigned successfully',
      noTasks: 'No inspection tasks',
      noTasksHint: 'Please create inspection plans to generate tasks',
      goToPlans: 'Go to Plans',
      overdue: 'Overdue',
      dueSoon: 'Due Soon',
    },

    // Task execution
    execution: {
      backToList: 'Back to List',
      taskInfo: 'Task Info',
      allNormal: 'All Normal',
      allNormalConfirm: 'Mark all unchecked items as normal?',
      submitTask: 'Submit Task',
      submitConfirm: 'Confirm submit? Unchecked items will be marked as skipped.',
      submitSuccess: 'Task submitted successfully',
      saveProgress: 'Save Progress',
      saveSuccess: 'Progress saved',
      checkedCount: 'Checked {{checked}}/{{total}}',
      normalCount: 'Normal',
      abnormalCount: 'Abnormal',
      remark: 'Remark',
      remarkPlaceholder: 'Enter abnormality description',
      guideTip: 'Click "Normal" or "Abnormal" to record check result',
    },

    // Plan list
    plan: {
      createPlan: 'Create Plan',
      planNo: 'Plan No.',
      name: 'Plan Name',
      cycle: 'Cycle',
      station: 'Station',
      checkItemCount: 'Check Items',
      estimatedTasks: 'Estimated Tasks',
      createdBy: 'Created By',
      createdAt: 'Created At',
      startDate: 'Start Date',
      endDate: 'End Date',
      editPlan: 'Edit Plan',
      cancelPlan: 'Cancel Plan',
      cancelConfirm: 'Cancel this plan? No new tasks will be generated.',
      cancelSuccess: 'Plan cancelled',
      dispatch: 'Dispatch Tasks',
      dispatchSuccess: 'Tasks dispatched successfully',
      noPlan: 'No inspection plans',
      noPlanHint: 'Click the button above to create your first plan',
    },

    // Plan form
    planForm: {
      create: 'Create Inspection Plan',
      edit: 'Edit Inspection Plan',
      basicInfo: 'Basic Info',
      selectCheckItems: 'Select Check Items',
      namePlaceholder: 'Enter plan name',
      stationPlaceholder: 'Select station',
      cyclePlaceholder: 'Select cycle',
      selectedItems: 'Selected Items',
      availableItems: 'Available Items',
      noItemsSelected: 'Select at least one check item',
      saveSuccess: 'Plan saved successfully',
      confirmLeave: 'Leave this page? Unsaved data will be lost',
    },

    // Plan detail
    planDetail: {
      backToList: 'Back to List',
      planInfo: 'Plan Info',
      associatedTasks: 'Associated Tasks',
      noTasks: 'No associated tasks',
      viewTask: 'View Task',
    },

    // Check items
    checkItem: {
      addItem: 'Add Check Item',
      editItem: 'Edit Check Item',
      manageTags: 'Manage Tags',
      name: 'Name',
      category: 'Category',
      description: 'Check Standard',
      station: 'Station',
      equipment: 'Equipment',
      tags: 'Tags',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      deactivate: 'Deactivate',
      activate: 'Activate',
      deactivateConfirm: 'Deactivate this check item? It will be skipped in plans.',
      activateConfirm: 'Activate this check item?',
      deactivateSuccess: 'Check item deactivated',
      activateSuccess: 'Check item activated',
      noItems: 'No check items',
      noItemsHint: 'Click the button above to add your first check item',
      namePlaceholder: 'Enter check item name',
      descriptionPlaceholder: 'Enter check standard or description',
      categoryPlaceholder: 'Select category',
      stationPlaceholder: 'Select station',
      equipmentPlaceholder: 'Select equipment',
      tagPlaceholder: 'Select tags',
      saveSuccess: 'Check item saved',
    },

    // Tag management
    tag: {
      title: 'Tag Management',
      name: 'Tag Name',
      color: 'Tag Color',
      addTag: 'Add Tag',
      editTag: 'Edit Tag',
      deleteTag: 'Delete Tag',
      deleteConfirm: 'Delete this tag?',
      deleteSuccess: 'Tag deleted',
      saveSuccess: 'Tag saved',
      namePlaceholder: 'Enter tag name',
    },

    // Issue records
    issue: {
      reportIssue: 'Report Issue',
      issueNo: 'Issue No.',
      title: 'Title',
      severity: 'Severity',
      status: 'Status',
      source: 'Source',
      fromInspection: 'From Inspection',
      fromManual: 'Manual Report',
      reportedBy: 'Reported By',
      reportedAt: 'Reported At',
      assignedTo: 'Assigned To',
      dueDate: 'Due Date',
      resolvedAt: 'Resolved At',
      description: 'Description',
      descriptionPlaceholder: 'Describe the issue in detail',
      titlePlaceholder: 'Enter issue title',
      urgent: 'Urgent',
      noIssues: 'No issue records',
      noIssuesHint: 'Issues will be generated when abnormalities are found during inspection',
    },

    // Issue detail
    issueDetail: {
      backToList: 'Back to List',
      issueInfo: 'Issue Info',
      timeline: 'Timeline',
      assignHandler: 'Assign Handler',
      startProcessing: 'Start Processing',
      submitResult: 'Submit Result',
      reviewResult: 'Review Result',
      closeIssue: 'Close Issue',
      selectHandler: 'Select Handler',
      assignSuccess: 'Handler assigned',
      startSuccess: 'Processing started',
      resultPlaceholder: 'Describe the resolution',
      submitResultSuccess: 'Result submitted',
      reviewApprove: 'Approve',
      reviewReject: 'Reject',
      rejectReason: 'Rejection Reason',
      rejectReasonPlaceholder: 'Enter rejection reason',
      reviewSuccess: 'Review completed',
      closeConfirm: 'Close this issue?',
      closeSuccess: 'Issue closed',
    },

    // Issue report drawer
    issueReport: {
      title: 'Report Issue',
      selectSeverity: 'Select Severity',
      relatedCheckItem: 'Related Check Item',
      relatedTask: 'Related Task',
      submitSuccess: 'Issue reported successfully',
    },

    // Inspection logs
    log: {
      executor: 'Executor',
      taskNo: 'Task',
      checkItem: 'Check Item',
      executedAt: 'Executed At',
      result: 'Result',
      remark: 'Remark',
      photos: 'Photos',
      noLogs: 'No inspection logs',
      noLogsHint: 'Logs are generated automatically after completing inspection tasks',
    },

    // Log detail
    logDetail: {
      backToList: 'Back to List',
      logInfo: 'Log Detail',
      noPhotos: 'No photos',
    },

    // Analytics
    analytics: {
      dailyTab: 'Daily Report',
      stationTab: 'Station Report',
      statisticsTab: 'Statistics',
      reportsTab: 'Reports',

      // Daily
      dailyDate: 'Select Date',
      plannedTasks: 'Planned Tasks',
      completedTasks: 'Completed Tasks',
      completionRate: 'Completion Rate',
      abnormalItems: 'Abnormal Items',
      executorDetail: 'Executor Detail',
      abnormalDetail: 'Abnormal Detail',
      assignedTasks: 'Assigned Tasks',
      normalItems: 'Normal Items',

      // Station report
      timeRange: 'Time Range',
      today: 'Today',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      custom: 'Custom',
      stationName: 'Station Name',
      totalTasks: 'Total Tasks',
      abnormalCount: 'Abnormal Count',
      issueCount: 'Issues',
      rectificationRate: 'Rectification Rate',

      // Statistics
      overallCompletionRate: 'Overall Completion Rate',
      overallAbnormalRate: 'Overall Abnormal Rate',
      pendingIssueCount: 'Pending Issues',
      monthlyInspectionCount: 'Monthly Inspections',
      byTime: 'By Time',
      byStation: 'By Station',
      byCheckItem: 'By Check Item',

      // Reports
      reportType: {
        completion: 'Completion Report',
        abnormal: 'Abnormal Analysis',
        rectification: 'Rectification Tracking',
        compliance: 'Compliance Report',
      },
      generateReport: 'Generate Report',
      generateSuccess: 'Report generated',
      reportHistory: 'Report History',
      viewReport: 'View Report',
      generatedAt: 'Generated At',
      generatedBy: 'Generated By',
    },

    // Report detail
    reportDetail: {
      backToAnalytics: 'Back to Analytics',
      reportInfo: 'Report Info',
      exportReport: 'Export Report',
      reportContent: 'Report Content',
    },
  },

  // Price Management
  price: {
    overview: {
      title: 'Price Overview',
      fuelTypes: 'Fuel Types',
      overrides: 'Override Nozzles',
      pending: 'Pending Adjustments',
      board: 'Price Board',
      viewBoard: 'View Board',
      pendingSchedule: 'Pending Schedule',
      detail: 'Fuel Price Details',
    },
    history: {
      title: 'Adjustment History',
      searchPlaceholder: 'Search by no./fuel/reason',
      detailTitle: 'Adjustment Detail',
      affectedNozzles: 'Affected Nozzles',
    },
    board: {
      title: 'Price Display Board',
      lastUpdate: 'Last Updated',
      subtitle: 'Real-time Price Display',
      standardPrice: 'Standard',
      memberPrice: 'Member',
      maxDiscount: 'Max Discount',
      unit: 'CNY',
    },
    approval: {
      title: 'Price Approval',
      approveTitle: 'Approve Adjustment',
      rejectTitle: 'Reject Adjustment',
      approved: 'Approved',
      rejected: 'Rejected',
      rejectNoteRequired: 'Rejection reason is required',
      rejectNotePlaceholder: 'Enter rejection reason (required)',
      approveNotePlaceholder: 'Optional note',
      empty: 'No pending approvals',
    },
    member: {
      title: 'Member Prices',
      add: 'Add Rule',
      empty: 'No member price rules',
    },
    agreement: {
      title: 'Price Agreements',
      add: 'Add Agreement',
      enterprise: 'Enterprise',
      agreedPrice: 'Agreed Price',
      discount: 'Discount',
      period: 'Valid Period',
      detailTitle: 'Agreement Detail',
      searchPlaceholder: 'Search enterprise/fuel',
      terminationReason: 'Termination Reason',
      empty: 'No price agreements',
      expiringSoon: 'Expiring Soon',
    },
    settings: {
      title: 'Price Settings',
      scope: 'Scope',
      global: 'Global Default',
      globalConfig: 'Global Defense Config',
      customConfigs: 'Station/Fuel Level Configs',
      maxIncrease: 'Max Increase',
      maxDecrease: 'Max Decrease',
      requireApproval: 'Approval Required',
      approvalThreshold: 'Approval Threshold',
      addConfig: 'Add Config',
      empty: 'No custom configs',
    },
    field: {
      adjustmentNo: 'Adjustment No.',
      fuelType: 'Fuel Type',
      fuelTypeName: 'Fuel Type',
      basePrice: 'Base Price',
      currentPrice: 'Current Price',
      newPrice: 'New Price',
      oldPrice: 'Old Price',
      priceChange: 'Price Change',
      change: 'Change',
      adjustmentType: 'Type',
      status: 'Status',
      nozzleNo: 'Nozzle No.',
      nozzleCount: 'Nozzles',
      pricingStatus: 'Pricing',
      diff: 'Base Diff',
      effectiveAt: 'Effective At',
      effectiveFrom: 'Effective From',
      lastAdjusted: 'Last Adjusted',
      adjustedBy: 'Initiated By',
      approvedBy: 'Approved By',
      approvedAt: 'Approved At',
      approvalNote: 'Approval Note',
      executedAt: 'Executed At',
      createdAt: 'Created At',
      createdBy: 'Created By',
      updatedBy: 'Updated By',
      updatedAt: 'Updated At',
      reason: 'Reason',
      memberTier: 'Tier',
      memberPrice: 'Member Price',
      discountType: 'Discount Type',
      discountValue: 'Discount Value',
      beforePrice: 'Before',
      afterPrice: 'After',
    },
    action: {
      adjust: 'Adjust',
      nozzleAdjust: 'Override',
      restoreBase: 'Restore Base',
      restored: 'Base price restored',
      approve: 'Approve',
      reject: 'Reject',
    },
    confirm: {
      restoreTitle: 'Restore to base price?',
      restoreDesc: 'Nozzle',
      restoreTo: 'will be restored to base price',
    },
    label: {
      override: 'Override',
      overridePrice: 'Override',
      followBase: 'Follow Base',
    },
    filter: {
      allStatus: 'All Status',
      allTypes: 'All Types',
      allFuelTypes: 'All Fuel Types',
      allTiers: 'All Tiers',
    },
    status: {
      pendingApproval: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      executed: 'Executed',
      cancelled: 'Cancelled',
    },
    type: {
      immediate: 'Immediate',
      scheduled: 'Scheduled',
    },
    tier: {
      normal: 'Regular',
    },
    agreementStatus: {
      active: 'Active',
      expired: 'Expired',
      terminated: 'Terminated',
    },
    unit: {
      types: '',
      nozzles: '',
      items: '',
      yuan: 'CNY',
    },
    empty: 'No fuel price data',
  },
};
