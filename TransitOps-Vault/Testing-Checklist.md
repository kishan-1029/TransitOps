# Testing Checklist

## All roles

- [ ] Login with wrong role → error  
- [ ] 5 bad passwords → account locked  
- [ ] Light / Dark toggle on login + app shell  

## Driver (`raven.k@transitops.in`)

- [ ] Dashboard shows trip + pool KPIs  
- [ ] Create trip 450 kg VAN-05 → dispatch  
- [ ] 700 kg blocked  
- [ ] Complete with odometer + fuel  

## Fleet Manager

- [ ] Vehicle registry columns all present  
- [ ] Unique reg rejection  
- [ ] Maintenance puts vehicle In Shop  
- [ ] Dashboard shows shop jobs + costs  

## Safety Officer

- [ ] License alerts on dashboard  
- [ ] Filter Expired / Expiring / Low Safety  
- [ ] Edit safety score  

## Financial Analyst

- [ ] Fuel + expense totals  
- [ ] Analytics ROI + profitability table  
- [ ] CSV download  
- [ ] Print/PDF  

## Van-05 judge path

1. Fleet: VAN-05 Available 500 kg  
2. Drivers: Alex valid license  
3. Driver role: trip 450 → dispatch → complete  
4. Fleet Mgr: maintenance → In Shop  
5. Finance: costs / ROI updated  
