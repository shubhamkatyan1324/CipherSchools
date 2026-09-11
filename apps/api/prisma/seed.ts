import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialProblems = [
  {
    slug: 'parking-lot',
    title: 'Parking Lot System',
    difficulty: 'MEDIUM',
    description:
      'Design a multi-level parking lot system that can manage different types of parking spots, handle multiple vehicle types, calculate fees dynamically based on duration and vehicle size, and track spot availability in real time.',
    requirements: JSON.stringify([
      'Support multiple floors with designated spots for Compact, Large, Disabled, and Motorcycle vehicles.',
      'Automatically assign nearest available spot to an incoming vehicle upon entry ticket issuance.',
      'Calculate parking fees based on vehicle type and duration (e.g. hourly rate, flat initial rate).',
      'Support electronic payment processing at exit gates and update spot availability instantly.',
      'Display real-time available spot counts per vehicle type at each floor entrance board.'
    ]),
    constraints: JSON.stringify([
      'The parking lot can handle up to 10 floors with 500 spots per floor.',
      'Concurrent vehicle entries and exits must be thread-safe without race conditions on spot allocation.',
      'Parking fees vary by peak vs off-peak hours.'
    ]),
    thinkingPoints: JSON.stringify([
      'How would you model different vehicle types while avoiding duplicated behavior?',
      'How would you make fee calculation replaceable if pricing rules change?',
      'How would you handle concurrent spot allocations safely under high traffic?',
      'How would you decouple third-party payment processing from core billing logic?'
    ])
  },
  {
    slug: 'elevator-system',
    title: 'Elevator Control System',
    difficulty: 'HARD',
    description:
      'Design an efficient multi-elevator control system for a modern high-rise building that dispatches elevators optimally based on passenger requests, floor traffic, direction, and energy consumption.',
    requirements: JSON.stringify([
      'Manage multiple elevator cars (e.g., 4-8 cars) servicing a 30-story building.',
      'Handle internal requests (passenger selects floor inside cabin) and external requests (up/down call buttons on floor hall).',
      'Dispatch the optimal elevator car considering current location, direction, speed, and passenger load capacity.',
      'Support emergency stop, maintenance mode, and VIP request overrides.',
      'Provide real-time status updates (current floor, direction, door status, passenger count).'
    ]),
    constraints: JSON.stringify([
      'Elevators must minimize average passenger wait time and prevent starvation.',
      'Weight capacity limits must trigger overload alerts and prevent movement.',
      'Power failures should trigger automatic descent to the nearest safe floor.'
    ]),
    thinkingPoints: JSON.stringify([
      'How would you keep elevator dispatching flexible if scheduling algorithms change?',
      'How would you manage elevator car transitions (idle, moving, maintenance) safely?',
      'How would you handle passenger requests and floor events asynchronously?'
    ])
  },
  {
    slug: 'vending-machine',
    title: 'Vending Machine',
    difficulty: 'EASY',
    description:
      'Design a vending machine system that manages product inventory, accepts multiple payment methods (coins, notes, digital payments), processes item selection, dispenses products, and returns change accurately.',
    requirements: JSON.stringify([
      'Maintain inventory of items organized by rack/slot number with price and quantity.',
      'Accept coins/notes inserted by user and maintain a current inserted balance counter.',
      'Allow user to select an item, validate sufficient inserted balance and inventory stock.',
      'Dispense item and return remaining change in optimal currency denominations upon successful transaction.',
      'Allow cancellation at any point before item release, returning all inserted money.'
    ]),
    constraints: JSON.stringify([
      'Machine must gracefully handle out-of-stock items and exact change unavailable scenarios.',
      'Refunds must strictly refund the exact denomination amounts inserted if transaction is aborted.'
    ]),
    thinkingPoints: JSON.stringify([
      'How would you manage machine state transitions cleanly without nested conditional logic?',
      'How would you enforce thread safety across inventory updates and coin dispensing?',
      'How would you handle transaction aborts and change calculation edge cases?'
    ])
  },
  {
    slug: 'library-management-system',
    title: 'Library Management System',
    difficulty: 'MEDIUM',
    description:
      'Design an automated library management system to manage book catalogs, member borrowing limits, reservation queues, fine calculations for overdue returns, and search filters.',
    requirements: JSON.stringify([
      'Maintain catalog of books, book items (physical copies), authors, and ISBNs.',
      'Support member registration, borrowing rules (max 5 books for 14 days), and card renewals.',
      'Allow members to place reservations on currently checked-out books.',
      'Calculate fine amount automatically for overdue returns (e.g. $1 per day).',
      'Provide multi-attribute search (title, author, subject, publication date).'
    ]),
    constraints: JSON.stringify([
      'A book can have multiple physical copies with distinct barcoded IDs.',
      'If a book copy is reserved, it cannot be issued to another walk-in member upon return.',
      'Fines must accumulate daily until the book is returned or declared lost.'
    ]),
    thinkingPoints: JSON.stringify([
      'How would you distinguish between book catalog metadata and physical copies?',
      'How would you handle dynamic fine rules and reservation queue priority?',
      'How would you notify members when reserved books become available?'
    ])
  }
];

async function main() {
  console.log('Seeding LLD problems into database...');
  for (const problem of initialProblems) {
    await prisma.problem.upsert({
      where: { slug: problem.slug },
      update: problem,
      create: problem
    });
  }
  console.log('Database seeding complete: 4 benchmark LLD problems created.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
