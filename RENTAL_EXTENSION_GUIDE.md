# Rental Extension & Equipment Status Guide

## Overview

This guide explains the new rental management features implemented in the Farm Equipment Sharing Platform, including equipment status tracking, rental extensions, and owner restrictions.

## Features Implemented

### 1. Equipment "Under Use" Status

Equipment that is currently rented shows an "Under Use" status across the platform:

- **Homepage**: Equipment cards display a "🔴 UNDER USE" overlay when actively rented
- **Detail Page**: Shows a red badge "Currently Rented" with renter information
- **Rental Information**: Displays current renter name, rental period, and total cost

**Technical Details:**
- Status checks for approved rentals with dates covering today
- Only shows for active/approved rentals, not pending ones
- Real-time status updates when rentals are approved/rejected

### 2. Owner Protection

Owners cannot rent their own equipment:

- When viewing their own equipment details, a protective message appears
- "You cannot rent your own equipment" warning in booking form
- Backend validates and prevents owner self-rental

**Workflow:**
1. Owner logs in and navigates to their equipment detail page
2. Instead of booking form, sees message: "This is your equipment. You cannot rent your own items."
3. Button to edit/manage equipment in dashboard

### 3. Rental Extension Feature

Farmers with active rentals can extend their rental period with automatic cost calculation:

#### How It Works:

**Step 1: Check Active Rental Status**
- If farmer has an active rental for equipment, sees "You Have an Active Rental" section
- Displays current rental dates and total cost paid

**Step 2: Request Extension**
- Click "Extend Rental" button to open extension form
- Select new end date (must be after current end date)

**Step 3: Cost Calculation**
- Additional days calculated automatically: `(New End Date - Current End Date)`
- Additional cost: `Additional Days × Daily Rate`
- New total cost: `Original Cost + Additional Cost`

**Step 4: Confirmation**
- Review calculated costs
- Click "Confirm Extension" to finalize
- System updates rental record with new end date and total cost

#### Example:
- Original Rental: Jan 1-10, 10 days × $50/day = $500
- Extend to: Jan 15 (5 additional days)
- Additional Cost: 5 × $50 = $250
- New Total: $750

### 4. Backend API Endpoints

#### Check Equipment Rental Status
```
GET /api/rentals/equipment/:equipment_id/status
```
Returns:
```json
{
  "isRented": true,
  "rental": {
    "id": 1,
    "equipment_id": 5,
    "renter_id": 2,
    "start_date": "2026-04-01",
    "end_date": "2026-04-15",
    "total_cost": 500,
    "renter_name": "John Doe"
  }
}
```

#### Get User's Active Rental for Equipment
```
GET /api/rentals/user/:user_id/equipment/:equipment_id
```
Returns active rental if exists, null otherwise

#### Extend Rental
```
POST /api/rentals/:rental_id/extend
```
Body:
```json
{
  "new_end_date": "2026-04-20",
  "additional_cost": 250
}
```

Response:
```json
{
  "message": "Rental extended successfully",
  "new_end_date": "2026-04-20",
  "new_total_cost": 750,
  "additional_cost": 250
}
```

## User Workflows

### For Farmers (Renters)

1. **Browse Equipment**
   - See "UNDER USE" badge on rented equipment
   - Can still click to view details and see who's renting it

2. **Rent Equipment**
   - Select dates and submit rental request
   - Cannot book if you own the equipment
   - Cannot book if already rented by someone else

3. **Extend Rental**
   - After rental is approved, can extend in equipment detail page
   - Select new end date
   - Review additional cost
   - Confirm extension

### For Equipment Owners

1. **View Equipment**
   - Cannot rent their own equipment (protection built-in)
   - Can manage equipment settings in dashboard

2. **Approve/Reject Rentals**
   - Dashboard shows pending rental requests
   - Can approve to activate rental period
   - Can reject if not suitable

## Status Values

- **pending**: Rental request submitted, awaiting owner approval
- **approved**: Owner approved, rental is active (shows "Under Use")
- **rejected**: Owner rejected the request
- **completed**: Rental period has ended

## Key Features

✅ **Real-time Status Updates**: Equipment availability updates immediately when rentals are approved/rejected

✅ **Cost Transparency**: Farmers see exactly how much extension will cost before confirming

✅ **Date Validation**: System prevents:
- Invalid date selections (end before start)
- Extension to date before current end date
- Overlapping rental periods (not double-bookable)

✅ **Owner Protection**: Owners cannot accidentally rent their own equipment

✅ **Flexible Rentals**: Farmers can extend stays without creating new rental requests

## Database Schema

The system uses these relevant fields in the `rentals` table:

```sql
- id: Rental ID
- equipment_id: Which equipment is rented
- renter_id: Who is renting
- owner_id: Who owns the equipment
- start_date: Rental start (YYYY-MM-DD format)
- end_date: Rental end (YYYY-MM-DD format)
- total_cost: Total rental cost (updated on extension)
- status: pending | approved | rejected | completed
```

## Testing the Feature

### Test Owner Protection
1. Log in as tractor owner
2. Go to their equipment detail page
3. Verify "cannot rent own equipment" message

### Test Under Use Status
1. Create rental as farmer
2. Owner approves rental
3. Check homepage - equipment should show "UNDER USE" overlay
4. Check detail page - should show current renter info

### Test Extension
1. Have active approved rental
2. Click "Extend Rental" button
3. Select dates and verify cost calculation
4. Confirm extension
5. Verify new end date in rental history

## Troubleshooting

**Equipment doesn't show "Under Use"**
- Check rental status is "approved" (not pending)
- Verify today's date falls within rental dates
- Check browser console for API errors

**Cannot extend rental**
- Ensure you have an active/approved rental
- Verify new end date is after current end date
- Check backend API is running

**Owner validation not working**
- Backend validates owner_id before rental creation
- Check user.id matches equipment.owner_id
- Verify localStorage has correct user data

