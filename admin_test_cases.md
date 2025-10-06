# Super Admin & Tenant Admin Comprehensive Test Cases

## Test Environment Setup
- Frontend running on localhost:3000
- Backend API available
- Test user accounts for different roles

## 🔥 SUPER ADMIN TEST CASES

### 1. Authentication & Access Control
#### Test Case SA-AUTH-001: Super Admin Login
- **Route**: `/super-admin/login`
- **Purpose**: Verify super admin can login with dedicated form
- **Expected**: Successful login redirects to `/super-admin`
- **Test Steps**:
  1. Navigate to `/super-admin/login`
  2. Enter super admin credentials (admin@gmail.com / 12345678)
  3. Click "Access Super Admin"
  4. Verify redirect to `/super-admin`

#### Test Case SA-AUTH-002: Super Admin Route Protection
- **Route**: `/super-admin`
- **Purpose**: Verify non-super-admin users cannot access super admin routes
- **Expected**: Redirect to `/unauthorized` for regular users
- **Test Steps**:
  1. Login as regular user
  2. Try to access `/super-admin`
  3. Verify redirect to `/unauthorized`

#### Test Case SA-AUTH-003: Super Admin Logout
- **Route**: `/super-admin` (logout button)
- **Purpose**: Verify super admin logout redirects to super admin login
- **Expected**: Redirect to `/super-admin/login`
- **Test Steps**:
  1. Login as super admin
  2. Click logout button
  3. Verify redirect to `/super-admin/login`

### 2. Super Admin Dashboard
#### Test Case SA-DASH-001: Dashboard Load
- **Route**: `/super-admin`
- **Purpose**: Verify dashboard loads with correct data
- **Expected**: Dashboard displays system overview, tenant stats, analytics
- **Test Steps**:
  1. Access `/super-admin`
  2. Verify system overview cards load
  3. Verify tenant management section appears
  4. Check for proper data formatting

#### Test Case SA-DASH-002: Period Filter
- **Route**: `/super-admin`
- **Purpose**: Verify period filter updates analytics
- **Expected**: Analytics refresh when period changed
- **Test Steps**:
  1. Access `/super-admin`
  2. Change period from "Last 30 days" to "Last 7 days"
  3. Verify analytics section updates

### 3. Tenant Management
#### Test Case SA-TENANT-001: View All Tenants
- **Route**: `/super-admin/tenants`
- **Purpose**: Verify tenant list loads and displays correctly
- **Expected**: List of all tenants with proper pagination and filtering
- **Test Steps**:
  1. Access `/super-admin/tenants`
  2. Verify tenant list loads
  3. Test search functionality
  4. Test status filter
  5. Verify pagination works

#### Test Case SA-TENANT-002: Add New Tenant
- **Route**: `/super-admin/add-tenant`
- **Purpose**: Verify new tenant creation
- **Expected**: Form validation and successful tenant creation
- **Test Steps**:
  1. Access `/super-admin/add-tenant`
  2. Fill required fields (company name, subdomain, admin details)
  3. Submit form
  4. Verify success message and tenant creation

#### Test Case SA-TENANT-003: Tenant Actions
- **Route**: `/super-admin/tenants` or `/super-admin`
- **Purpose**: Verify tenant management actions (suspend, activate, etc.)
- **Expected**: Actions work correctly with proper confirmations
- **Test Steps**:
  1. Find a tenant in the list
  2. Test "View" action
  3. Test "Suspend" action with reason
  4. Test "Activate" action
  5. Test "Change Plan" action

### 4. Super Admin Navigation
#### Test Case SA-NAV-001: Sidebar Navigation
- **Purpose**: Verify all sidebar links work correctly
- **Expected**: All menu items navigate to correct routes
- **Test Steps**:
  1. Test "Super Admin Dashboard" link
  2. Test "Tenant Management" link
  3. Test "Add New Tenant" link
  4. Verify active states update correctly

## 🏢 TENANT ADMIN TEST CASES

### 1. Authentication & Access Control
#### Test Case TA-AUTH-001: Tenant Admin Access
- **Route**: `/tenant-admin`
- **Purpose**: Verify role-based access for tenant admins (role = 3)
- **Expected**: Only users with role 3 can access
- **Test Steps**:
  1. Login as user with role 3
  2. Access `/tenant-admin`
  3. Verify dashboard loads
  4. Try accessing with role 1/2 user
  5. Verify redirect to `/unauthorized`

### 2. Tenant Admin Dashboard
#### Test Case TA-DASH-001: Dashboard Load
- **Route**: `/tenant-admin`
- **Purpose**: Verify tenant dashboard loads with tenant-specific data
- **Expected**: Dashboard shows tenant name, metrics, recent orders
- **Test Steps**:
  1. Access `/tenant-admin` as role 3 user
  2. Verify tenant name displays correctly
  3. Verify metrics cards show data
  4. Check orders by status chart
  5. Verify recent orders list

#### Test Case TA-DASH-002: Period Filter
- **Route**: `/tenant-admin`
- **Purpose**: Verify analytics period filtering works
- **Expected**: Data updates when period changed
- **Test Steps**:
  1. Access tenant dashboard
  2. Change period filter
  3. Verify metrics update
  4. Verify charts refresh

### 3. Usage Limits & Warnings
#### Test Case TA-USAGE-001: Usage Warnings
- **Route**: `/tenant-admin`
- **Purpose**: Verify usage warnings display when approaching limits
- **Expected**: Warning messages appear when near limits
- **Test Steps**:
  1. Access tenant dashboard
  2. Check if usage warning section appears
  3. Verify warning messages are informative
  4. Test with tenant approaching limits

## 🔒 CROSS-FUNCTIONAL TEST CASES

### 1. Role-Based Route Protection
#### Test Case CF-ROLE-001: Route Protection Matrix
- **Purpose**: Verify all routes respect role-based access control
- **Test Matrix**:

| Route | Role 0 (Driver) | Role 1 (Staff) | Role 2 (Manager) | Role 3 (Admin) | Super Admin |
|-------|----------------|----------------|------------------|----------------|-------------|
| `/super-admin` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/super-admin/tenants` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/super-admin/add-tenant` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/tenant-admin` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/order/add` | ❌ | ✅ | ❌ | ✅ | ✅ |
| `/payments` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `/commodity-and-equipments` | ❌ | ❌ | ❌ | ✅ | ✅ |

### 2. Multi-Tenant Context
#### Test Case CF-TENANT-001: Tenant Context Switching
- **Purpose**: Verify super admin can emulate/view different tenants
- **Expected**: Context switches properly without auth issues
- **Test Steps**:
  1. Login as super admin
  2. View tenant from dashboard
  3. Verify tenant context switches
  4. Verify data is tenant-specific
  5. Return to super admin context

### 3. State Management
#### Test Case CF-STATE-001: Authentication State Persistence
- **Purpose**: Verify auth state persists across page refreshes
- **Expected**: Users remain logged in after refresh
- **Test Steps**:
  1. Login as super admin
  2. Navigate to different pages
  3. Refresh browser
  4. Verify still authenticated and on correct page

#### Test Case CF-STATE-002: Logout State Cleanup
- **Purpose**: Verify all state is cleared on logout
- **Expected**: No residual data after logout
- **Test Steps**:
  1. Login and navigate around
  2. Logout
  3. Verify localStorage is cleared
  4. Verify redirect to appropriate login page
  5. Try accessing protected routes

## 🐛 EDGE CASES & ERROR HANDLING

### 1. API Error Handling
#### Test Case EDGE-001: Network Errors
- **Purpose**: Verify graceful handling of network failures
- **Expected**: User-friendly error messages, no app crashes
- **Test Steps**:
  1. Disconnect network
  2. Try loading dashboards
  3. Verify error messages appear
  4. Reconnect and verify recovery

#### Test Case EDGE-002: Invalid API Responses
- **Purpose**: Verify handling of malformed API responses
- **Expected**: Fallback data or appropriate error messages
- **Test Steps**:
  1. Monitor console for API errors
  2. Check handling of empty responses
  3. Verify no JavaScript errors occur

### 2. UI/UX Edge Cases
#### Test Case EDGE-003: Responsive Design
- **Purpose**: Verify admin interfaces work on different screen sizes
- **Expected**: Proper layout on mobile, tablet, desktop
- **Test Steps**:
  1. Test super admin dashboard on mobile
  2. Test tenant dashboard on tablet
  3. Verify sidebar behavior
  4. Check form layouts

#### Test Case EDGE-004: Long Data Sets
- **Purpose**: Verify performance with large tenant/user lists
- **Expected**: Pagination and filtering work smoothly
- **Test Steps**:
  1. Test with many tenants
  2. Verify pagination performance
  3. Test search with large datasets
  4. Check memory usage

## 📋 TEST EXECUTION CHECKLIST

### Pre-Test Setup
- [ ] Backend API is running
- [ ] Test database has sample data
- [ ] Super admin account exists (admin@gmail.com / 12345678)
- [ ] Regular user accounts exist for each role (0, 1, 2, 3)
- [ ] Network connectivity is stable

### Test Execution Order
1. **Authentication Tests** (SA-AUTH-*, TA-AUTH-*)
2. **Dashboard Tests** (SA-DASH-*, TA-DASH-*)
3. **Functionality Tests** (SA-TENANT-*, SA-NAV-*)
4. **Cross-Functional Tests** (CF-*)
5. **Edge Cases** (EDGE-*)

### Post-Test Verification
- [ ] No console errors
- [ ] No memory leaks
- [ ] All routes accessible to appropriate roles
- [ ] Data consistency maintained
- [ ] Logout cleans all state

## 🚨 CRITICAL ISSUES TO WATCH FOR

1. **Security**: Unauthorized access to admin routes
2. **Data Leakage**: One tenant seeing another's data
3. **State Management**: Auth state inconsistencies
4. **Performance**: Slow loading of large datasets
5. **UI/UX**: Broken layouts or non-functional buttons
6. **Error Handling**: App crashes on API failures

This comprehensive test plan covers all major functionality and edge cases for both Super Admin and Tenant Admin roles.