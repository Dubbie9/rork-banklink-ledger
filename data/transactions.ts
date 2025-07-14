import { Transaction } from "@/types";
import { v4 as uuidv4 } from "@/utils/uuid";

// Enhanced mock counterparties with more realistic names
const counterparties = [
  { id: "cp1", name: "John Smith" },
  { id: "cp2", name: "Sarah Johnson" },
  { id: "cp3", name: "Michael Brown" },
  { id: "cp4", name: "Emma Wilson" },
  { id: "cp5", name: "David Taylor" },
  { id: "cp6", name: "Olivia Davis" },
  { id: "cp7", name: "James Miller" },
  { id: "cp8", name: "Sophia Anderson" },
  { id: "cp9", name: "William Thomas" },
  { id: "cp10", name: "Ava Martinez" },
  { id: "cp11", name: "Robert Garcia" },
  { id: "cp12", name: "Isabella Rodriguez" },
  { id: "cp13", name: "Christopher Lee" },
  { id: "cp14", name: "Charlotte Walker" },
  { id: "cp15", name: "Daniel Hall" },
  { id: "cp16", name: "Amelia Young" },
  { id: "cp17", name: "Matthew King" },
  { id: "cp18", name: "Harper Wright" },
  { id: "cp19", name: "Anthony Lopez" },
  { id: "cp20", name: "Evelyn Hill" },
  { id: "cp21", name: "Benjamin Clark" },
  { id: "cp22", name: "Mia Lewis" },
  { id: "cp23", name: "Lucas Robinson" },
  { id: "cp24", name: "Grace Turner" },
  { id: "cp25", name: "Alexander White" },
  { id: "cp26", name: "Chloe Harris" },
  { id: "cp27", name: "Henry Martin" },
  { id: "cp28", name: "Lily Thompson" },
  { id: "cp29", name: "Sebastian Moore" },
  { id: "cp30", name: "Zoe Jackson" },
];

// Enhanced transaction descriptions with more variety
const outgoingDescriptions = [
  "Monthly rent payment",
  "Electricity bill payment",
  "Dinner at restaurant",
  "Personal loan repayment",
  "Split grocery bill",
  "Birthday gift money",
  "Concert ticket payment",
  "Holiday accommodation booking",
  "Car repair payment",
  "Weekly shopping split",
  "Gym membership fee",
  "Coffee meetup payment",
  "Taxi fare split",
  "Movie tickets",
  "Lunch payment",
  "Petrol money",
  "Phone bill contribution",
  "Internet bill split",
  "Takeaway order payment",
  "Parking fee reimbursement",
  "Wedding gift contribution",
  "House cleaning service",
  "Uber ride payment",
  "Netflix subscription share",
  "Spotify family plan",
  "Amazon Prime split",
  "Grocery delivery tip",
  "Hairdresser appointment",
  "Dentist payment",
  "Vet bills for pet",
  "Book purchase",
  "Online course fee",
  "Charity donation",
  "Christmas present",
  "Valentine's dinner",
];

const incomingDescriptions = [
  "Monthly salary payment",
  "Expense reimbursement",
  "Loan repayment received",
  "Utility bill contribution",
  "Gift money received",
  "Event ticket refund",
  "Rent contribution",
  "Dinner bill split",
  "Holiday expense share",
  "Freelance project payment",
  "Bonus payment",
  "Tax refund",
  "Insurance claim",
  "Cashback reward",
  "Competition prize",
  "Refund for cancelled order",
  "Commission payment",
  "Dividend payment",
  "Interest payment",
  "Rental income",
  "Birthday money gift",
  "Wedding gift received",
  "Graduation gift",
  "Christmas money",
  "Lottery winnings",
  "Cashback from purchase",
  "Refund from store",
  "Deposit return",
  "Overpayment refund",
  "Pension payment",
  "Child benefit",
  "Student loan",
  "Grant payment",
  "Inheritance",
  "Investment return",
];

// Generate a random date within the last 90 days
function getRandomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 90);
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
}

// Generate a random amount with more realistic distribution
function getRandomAmount(min: number, max: number) {
  // Create a weighted distribution favoring smaller amounts
  const random = Math.random();
  let amount;
  
  if (random < 0.4) {
    // 40% chance of small amounts (£5-£50)
    amount = Math.random() * 45 + 5;
  } else if (random < 0.7) {
    // 30% chance of medium amounts (£50-£200)
    amount = Math.random() * 150 + 50;
  } else if (random < 0.9) {
    // 20% chance of larger amounts (£200-£500)
    amount = Math.random() * 300 + 200;
  } else {
    // 10% chance of very large amounts (£500-£2000)
    amount = Math.random() * 1500 + 500;
  }
  
  return parseFloat(amount.toFixed(2));
}

// Generate mock transactions for a bank with more realistic patterns
export function generateMockTransactions(bankId: string, count = 35): Transaction[] {
  const transactions: Transaction[] = [];

  for (let i = 0; i < count; i++) {
    const counterparty = counterparties[Math.floor(Math.random() * counterparties.length)];
    // Slightly favor outgoing transactions (60/40 split)
    const type = Math.random() > 0.4 ? "outgoing" : "incoming";
    const descriptions = type === "outgoing" ? outgoingDescriptions : incomingDescriptions;
    
    transactions.push({
      id: uuidv4(),
      bankId,
      amount: getRandomAmount(5, 2000),
      date: getRandomDate(),
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      type,
      counterpartyId: counterparty.id,
      counterpartyName: counterparty.name,
      reference: `REF${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
    });
  }

  // Sort transactions by date (newest first)
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}