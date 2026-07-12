# Features by Role

Demo password: **`Password@123`**

## Fleet Manager — `fleet@transitops.in`

**Nav:** Dashboard, Fleet, Drivers, Trips (view), Maintenance, Fuel (view), Analytics, Settings  

**Dashboard extras:** Open shop jobs, avg safety, ops cost, fleet revenue, active maintenance list  

**Test:**
1. Fleet → confirm VAN-05 unique reg, statuses Available/On Trip/In Shop/Retired  
2. Maintenance → Oil Change → vehicle becomes In Shop  
3. Analytics → ROI / CSV  

---

## Driver — `raven.k@transitops.in`  *(problem-statement “Driver” role)*

**Nav:** Dashboard, Fleet (view), Drivers (view), Trips (full), Settings (view)  

**Can:** Create trips, assign available vehicle/driver, dispatch, complete (odometer+fuel), cancel  

**Dashboard extras:** Live dispatches, draft queue, dispatch pool  

**Test:**
1. Trips → cargo 450 on VAN-05 → Create Draft → Dispatch  
2. Cargo 700 → capacity error  
3. Complete trip → vehicle+driver Available  

> Alias: `dispatch@transitops.in` → DISPATCHER (same permissions)

---

## Safety Officer — `safety@transitops.in`

**Nav:** Dashboard, Fleet (view), Drivers (full), Trips (view), Settings  

**Dashboard extras:** Expired licenses, expiring ≤30d, low safety count, compliance alerts  

**Drivers page:** Filters (Expired / Expiring / Low Safety / Suspended), edit safety score & license expiry  

**Test:**
1. Drivers → filter Expired → Priya  
2. Edit score on a driver  
3. Confirm expired/suspended blocked from trip assignment (as Driver role)

---

## Financial Analyst — `finance@transitops.in`

**Nav:** Dashboard, Fleet (view), Maintenance (view), Fuel & Expenses (full), Analytics (full)  

**Dashboard extras:** Fuel cost, maint cost, other expenses, profit  

**Analytics:** Fuel efficiency km/l, utilization, ops cost, ROI formula, profitability table, CSV + Print/PDF  

**Test:**
1. Fuel → log fuel / expense → total ops cost updates  
2. Analytics → Export CSV · Print/PDF  
3. Verify ROI formula line on page  
