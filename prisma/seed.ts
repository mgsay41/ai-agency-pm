import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (optional - be careful in production!)
  console.log('📊 Clearing existing data...');
  await prisma.activityLog.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.meetingAttendee.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.projectAssignment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.clientContact.deleteMany();
  await prisma.client.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin User
  console.log('👤 Creating admin user...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@aiagency.com',
      passwordHash: '$2a$10$rQ5Z9YzZ9YzZ9YzZ9YzZ9O', // placeholder - will be replaced by Better Auth
      fullName: 'Admin User',
      role: 'ADMIN',
      phone: '+1-555-0100',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create Team Members Users
  console.log('👥 Creating team member users...');
  const teamUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@aiagency.com',
        passwordHash: '$2a$10$rQ5Z9YzZ9YzZ9YzZ9YzZ9O',
        fullName: 'John Doe',
        role: 'TEAM_MEMBER',
        phone: '+1-555-0101',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@aiagency.com',
        passwordHash: '$2a$10$rQ5Z9YzZ9YzZ9YzZ9YzZ9O',
        fullName: 'Jane Smith',
        role: 'TEAM_MEMBER',
        phone: '+1-555-0102',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob.wilson@aiagency.com',
        passwordHash: '$2a$10$rQ5Z9YzZ9YzZ9YzZ9YzZ9O',
        fullName: 'Bob Wilson',
        role: 'TEAM_MEMBER',
        phone: '+1-555-0103',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${teamUsers.length} team member users`);

  // Create Team Members
  console.log('🎨 Creating team members...');
  const teamMembers = await Promise.all([
    prisma.teamMember.create({
      data: {
        userId: teamUsers[0].id,
        fullName: 'John Doe',
        email: 'john.doe@aiagency.com',
        phone: '+1-555-0101',
        roleTitle: 'Senior Full Stack Developer',
        department: 'DEVELOPMENT',
        specialization: ['Full Stack', 'Backend Development'],
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
        hourlyRate: 150,
        currency: 'USD',
        employmentType: 'FULL_TIME',
        startDate: new Date('2024-01-15'),
        status: 'ACTIVE',
        avatarColor: '#3B82F6',
        bio: 'Experienced full-stack developer with 8+ years in web development.',
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        githubUrl: 'https://github.com/johndoe',
        createdBy: adminUser.id,
      },
    }),
    prisma.teamMember.create({
      data: {
        userId: teamUsers[1].id,
        fullName: 'Jane Smith',
        email: 'jane.smith@aiagency.com',
        phone: '+1-555-0102',
        roleTitle: 'UI/UX Designer',
        department: 'DESIGN',
        specialization: ['UI Design', 'UX Design'],
        skills: ['Figma', 'Adobe XD', 'Sketch', 'HTML/CSS', 'Design Systems'],
        hourlyRate: 120,
        currency: 'USD',
        employmentType: 'FULL_TIME',
        startDate: new Date('2024-03-01'),
        status: 'ACTIVE',
        avatarColor: '#EC4899',
        bio: 'Creative designer focused on user-centered design principles.',
        linkedinUrl: 'https://linkedin.com/in/janesmith',
        createdBy: adminUser.id,
      },
    }),
    prisma.teamMember.create({
      data: {
        userId: teamUsers[2].id,
        fullName: 'Bob Wilson',
        email: 'bob.wilson@aiagency.com',
        phone: '+1-555-0103',
        roleTitle: 'AI/ML Engineer',
        department: 'DEVELOPMENT',
        specialization: ['AI/ML Engineering', 'Backend Development'],
        skills: ['Python', 'TensorFlow', 'PyTorch', 'LangChain', 'OpenAI API'],
        hourlyRate: 175,
        currency: 'USD',
        employmentType: 'CONTRACTOR',
        startDate: new Date('2024-02-15'),
        status: 'ACTIVE',
        avatarColor: '#10B981',
        bio: 'AI specialist with focus on LLMs and automation.',
        githubUrl: 'https://github.com/bobwilson',
        createdBy: adminUser.id,
      },
    }),
    prisma.teamMember.create({
      data: {
        fullName: 'Sarah Johnson',
        email: 'sarah.johnson@aiagency.com',
        phone: '+1-555-0104',
        roleTitle: 'QA Engineer',
        department: 'QA',
        specialization: ['QA Automation', 'Manual Testing'],
        skills: ['Selenium', 'Jest', 'Playwright', 'API Testing', 'Postman'],
        hourlyRate: 100,
        currency: 'USD',
        employmentType: 'PART_TIME',
        startDate: new Date('2024-04-01'),
        status: 'ACTIVE',
        avatarColor: '#F59E0B',
        bio: 'Quality-focused engineer ensuring product excellence.',
        createdBy: adminUser.id,
      },
    }),
  ]);

  console.log(`✅ Created ${teamMembers.length} team members`);

  // Create Clients
  console.log('🏢 Creating clients...');
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        clientType: 'COMPANY',
        companyName: 'TechCorp Solutions',
        industry: 'Technology',
        companySize: '201-500',
        website: 'https://techcorp.com',
        billingAddress: '123 Tech Street, San Francisco, CA 94105',
        timeZone: 'America/Los_Angeles',
        preferredCommunication: ['Email', 'Slack'],
        tags: ['Enterprise', 'Long-term'],
        notes: 'Major enterprise client, handles large-scale AI projects.',
        isActive: true,
        clientSince: new Date('2023-06-15'),
        createdBy: adminUser.id,
      },
    }),
    prisma.client.create({
      data: {
        clientType: 'COMPANY',
        companyName: 'StartupX Inc',
        industry: 'FinTech',
        companySize: '11-50',
        website: 'https://startupx.io',
        billingAddress: '456 Innovation Ave, Austin, TX 78701',
        timeZone: 'America/Chicago',
        preferredCommunication: ['Email', 'Phone'],
        tags: ['Startup', 'Fast-paced'],
        notes: 'Innovative fintech startup, quick turnaround projects.',
        isActive: true,
        clientSince: new Date('2024-01-10'),
        createdBy: adminUser.id,
      },
    }),
    prisma.client.create({
      data: {
        clientType: 'COMPANY',
        companyName: 'BigCo Industries',
        industry: 'Manufacturing',
        companySize: '1000+',
        website: 'https://bigco.com',
        billingAddress: '789 Industrial Blvd, Detroit, MI 48201',
        timeZone: 'America/Detroit',
        preferredCommunication: ['Email', 'Teams'],
        tags: ['Enterprise', 'Automation'],
        notes: 'Large manufacturing company focusing on automation solutions.',
        isActive: true,
        clientSince: new Date('2023-09-20'),
        createdBy: adminUser.id,
      },
    }),
  ]);

  console.log(`✅ Created ${clients.length} clients`);

  // Create Client Contacts
  console.log('📞 Creating client contacts...');
  await Promise.all([
    prisma.clientContact.create({
      data: {
        clientId: clients[0].id,
        isPrimary: true,
        contactName: 'Michael Chen',
        jobTitle: 'CTO',
        email: 'michael.chen@techcorp.com',
        phone: '+1-415-555-0200',
        mobile: '+1-415-555-0201',
        linkedinUrl: 'https://linkedin.com/in/michaelchen',
      },
    }),
    prisma.clientContact.create({
      data: {
        clientId: clients[1].id,
        isPrimary: true,
        contactName: 'Emily Rodriguez',
        jobTitle: 'Product Manager',
        email: 'emily@startupx.io',
        phone: '+1-512-555-0300',
        linkedinUrl: 'https://linkedin.com/in/emilyrodriguez',
      },
    }),
    prisma.clientContact.create({
      data: {
        clientId: clients[2].id,
        isPrimary: true,
        contactName: 'David Thompson',
        jobTitle: 'VP of Operations',
        email: 'david.thompson@bigco.com',
        phone: '+1-313-555-0400',
        mobile: '+1-313-555-0401',
      },
    }),
  ]);

  console.log('✅ Created client contacts');

  // Create Projects
  console.log('📊 Creating projects...');
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        projectName: 'AI Customer Support Agent',
        projectCode: 'TECH-2026-001',
        clientId: clients[0].id,
        projectType: 'AI_AGENT',
        description: 'Build an AI-powered customer support agent using LLMs to handle tier-1 support queries automatically.',
        internalNotes: 'Client wants 24/7 availability and multi-language support.',
        status: 'ACTIVE',
        priority: 'HIGH',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-04-30'),
        estimatedHours: 320,
        budgetAmount: 48000,
        currency: 'USD',
        billingType: 'FIXED_PRICE',
        progressPercentage: 45,
        currentPhase: 'Development',
        healthStatus: 'ON_TRACK',
        createdBy: adminUser.id,
      },
    }),
    prisma.project.create({
      data: {
        projectName: 'Automated Onboarding System',
        projectCode: 'STRT-2026-001',
        clientId: clients[1].id,
        projectType: 'AUTOMATION',
        description: 'Automate the customer onboarding process with document processing and verification.',
        internalNotes: 'Quick turnaround needed. MVP in 6 weeks.',
        status: 'PLANNING',
        priority: 'HIGH',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-05-31'),
        estimatedHours: 280,
        budgetAmount: 35000,
        currency: 'USD',
        billingType: 'TIME_MATERIALS',
        progressPercentage: 15,
        currentPhase: 'Planning',
        healthStatus: 'ON_TRACK',
        createdBy: adminUser.id,
      },
    }),
    prisma.project.create({
      data: {
        projectName: 'Manufacturing Process Optimization',
        projectCode: 'BIG-2026-001',
        clientId: clients[2].id,
        projectType: 'AUTOMATION',
        description: 'Optimize manufacturing processes using AI-powered analytics and predictive maintenance.',
        internalNotes: 'Long-term project with potential for expansion.',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2026-06-30'),
        estimatedHours: 480,
        budgetAmount: 72000,
        currency: 'USD',
        billingType: 'RETAINER',
        progressPercentage: 30,
        currentPhase: 'Phase 2: Data Analysis',
        healthStatus: 'AT_RISK',
        createdBy: adminUser.id,
      },
    }),
    prisma.project.create({
      data: {
        projectName: 'Internal Dashboard Redesign',
        projectCode: 'TECH-2025-004',
        clientId: clients[0].id,
        projectType: 'SAAS',
        description: 'Redesign and rebuild the internal analytics dashboard with modern UI/UX.',
        internalNotes: 'Lower priority, can be flexible with timeline.',
        status: 'ON_HOLD',
        priority: 'LOW',
        startDate: new Date('2025-11-01'),
        endDate: new Date('2026-02-28'),
        estimatedHours: 160,
        budgetAmount: 20000,
        currency: 'USD',
        billingType: 'FIXED_PRICE',
        progressPercentage: 25,
        currentPhase: 'Design',
        createdBy: adminUser.id,
      },
    }),
    prisma.project.create({
      data: {
        projectName: 'AI Strategy Consulting',
        projectCode: 'STRT-2025-003',
        clientId: clients[1].id,
        projectType: 'CONSULTING',
        description: 'Provide strategic consulting on AI implementation roadmap.',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-12-31'),
        actualStartDate: new Date('2025-10-05'),
        actualEndDate: new Date('2025-12-20'),
        estimatedHours: 80,
        budgetAmount: 15000,
        currency: 'USD',
        billingType: 'TIME_MATERIALS',
        progressPercentage: 100,
        currentPhase: 'Completed',
        createdBy: adminUser.id,
      },
    }),
  ]);

  console.log(`✅ Created ${projects.length} projects`);

  // Create Project Assignments
  console.log('👥 Creating project assignments...');
  await Promise.all([
    // AI Customer Support Agent assignments
    prisma.projectAssignment.create({
      data: {
        projectId: projects[0].id,
        memberId: teamMembers[0].id,
        roleInProject: 'Project Lead',
        allocationPercentage: 80,
        startDate: new Date('2026-01-01'),
        isActive: true,
      },
    }),
    prisma.projectAssignment.create({
      data: {
        projectId: projects[0].id,
        memberId: teamMembers[2].id,
        roleInProject: 'AI Engineer',
        allocationPercentage: 100,
        startDate: new Date('2026-01-01'),
        isActive: true,
      },
    }),
    // Automated Onboarding System assignments
    prisma.projectAssignment.create({
      data: {
        projectId: projects[1].id,
        memberId: teamMembers[0].id,
        roleInProject: 'Technical Lead',
        allocationPercentage: 60,
        startDate: new Date('2026-02-01'),
        isActive: true,
      },
    }),
    // Manufacturing Process Optimization assignments
    prisma.projectAssignment.create({
      data: {
        projectId: projects[2].id,
        memberId: teamMembers[2].id,
        roleInProject: 'AI Consultant',
        allocationPercentage: 70,
        startDate: new Date('2025-12-01'),
        isActive: true,
      },
    }),
    prisma.projectAssignment.create({
      data: {
        projectId: projects[2].id,
        memberId: teamMembers[3].id,
        roleInProject: 'QA Engineer',
        allocationPercentage: 50,
        startDate: new Date('2025-12-15'),
        isActive: true,
      },
    }),
    // Dashboard Redesign assignments
    prisma.projectAssignment.create({
      data: {
        projectId: projects[3].id,
        memberId: teamMembers[1].id,
        roleInProject: 'Lead Designer',
        allocationPercentage: 100,
        startDate: new Date('2025-11-01'),
        isActive: false,
      },
    }),
  ]);

  console.log('✅ Created project assignments');

  // Create Meetings
  console.log('📅 Creating meetings...');
  const meetings = await Promise.all([
    prisma.meeting.create({
      data: {
        projectId: projects[0].id,
        meetingDate: new Date('2026-01-05T10:00:00Z'),
        durationMinutes: 60,
        meetingType: 'KICKOFF',
        locationPlatform: 'Zoom',
        agenda: 'Project kickoff, review requirements, discuss timeline and deliverables.',
        notes: 'Great kickoff meeting. Client is excited about the project. Discussed technical architecture and agreed on weekly sync meetings.',
        nextMeetingDate: new Date('2026-01-12T10:00:00Z'),
        nextMeetingNotes: 'Weekly progress sync',
        createdBy: adminUser.id,
      },
    }),
    prisma.meeting.create({
      data: {
        projectId: projects[0].id,
        meetingDate: new Date('2026-01-12T10:00:00Z'),
        durationMinutes: 45,
        meetingType: 'REVIEW',
        locationPlatform: 'Zoom',
        agenda: 'Review progress, discuss blockers, plan next sprint.',
        notes: 'Good progress on MVP. Need to clarify some edge cases with the client.',
        nextMeetingDate: new Date('2026-01-19T10:00:00Z'),
        createdBy: adminUser.id,
      },
    }),
    prisma.meeting.create({
      data: {
        projectId: projects[1].id,
        meetingDate: new Date('2026-01-20T14:00:00Z'),
        durationMinutes: 90,
        meetingType: 'DISCOVERY',
        locationPlatform: 'Google Meet',
        agenda: 'Deep dive into current onboarding process, pain points, and desired automation.',
        notes: 'Identified key bottlenecks. Document verification takes 3-5 days manually. Client wants this reduced to 24 hours.',
        createdBy: adminUser.id,
      },
    }),
  ]);

  console.log(`✅ Created ${meetings.length} meetings`);

  // Create Meeting Attendees
  console.log('👔 Creating meeting attendees...');
  await Promise.all([
    // Kickoff meeting attendees
    prisma.meetingAttendee.create({
      data: {
        meetingId: meetings[0].id,
        memberId: teamMembers[0].id,
        attendeeType: 'INTERNAL',
        attended: true,
      },
    }),
    prisma.meetingAttendee.create({
      data: {
        meetingId: meetings[0].id,
        memberId: teamMembers[2].id,
        attendeeType: 'INTERNAL',
        attended: true,
      },
    }),
    prisma.meetingAttendee.create({
      data: {
        meetingId: meetings[0].id,
        externalName: 'Michael Chen',
        externalEmail: 'michael.chen@techcorp.com',
        attendeeType: 'EXTERNAL',
        attended: true,
      },
    }),
    // Progress review attendees
    prisma.meetingAttendee.create({
      data: {
        meetingId: meetings[1].id,
        memberId: teamMembers[0].id,
        attendeeType: 'INTERNAL',
        attended: true,
      },
    }),
    prisma.meetingAttendee.create({
      data: {
        meetingId: meetings[1].id,
        externalName: 'Michael Chen',
        externalEmail: 'michael.chen@techcorp.com',
        attendeeType: 'EXTERNAL',
        attended: true,
      },
    }),
    // Discovery meeting attendees
    prisma.meetingAttendee.create({
      data: {
        meetingId: meetings[2].id,
        memberId: teamMembers[0].id,
        attendeeType: 'INTERNAL',
        attended: true,
      },
    }),
    prisma.meetingAttendee.create({
      data: {
        meetingId: meetings[2].id,
        externalName: 'Emily Rodriguez',
        externalEmail: 'emily@startupx.io',
        attendeeType: 'EXTERNAL',
        attended: true,
      },
    }),
  ]);

  console.log('✅ Created meeting attendees');

  // Create Action Items
  console.log('📝 Creating action items...');
  await Promise.all([
    prisma.actionItem.create({
      data: {
        meetingId: meetings[0].id,
        description: 'Set up development environment and repository',
        assignedTo: teamMembers[0].id,
        dueDate: new Date('2026-01-07'),
        status: 'COMPLETED',
        completedAt: new Date('2026-01-06'),
      },
    }),
    prisma.actionItem.create({
      data: {
        meetingId: meetings[0].id,
        description: 'Research and select LLM provider',
        assignedTo: teamMembers[2].id,
        dueDate: new Date('2026-01-10'),
        status: 'COMPLETED',
        completedAt: new Date('2026-01-09'),
      },
    }),
    prisma.actionItem.create({
      data: {
        meetingId: meetings[1].id,
        description: 'Create technical documentation for API endpoints',
        assignedTo: teamMembers[0].id,
        dueDate: new Date('2026-01-15'),
        status: 'IN_PROGRESS',
      },
    }),
    prisma.actionItem.create({
      data: {
        meetingId: meetings[2].id,
        description: 'Map out current onboarding workflow',
        dueDate: new Date('2026-01-25'),
        status: 'OPEN',
      },
    }),
  ]);

  console.log('✅ Created action items');

  // Create Activity Logs
  console.log('📋 Creating activity logs...');
  await Promise.all([
    prisma.activityLog.create({
      data: {
        userId: adminUser.id,
        entityType: 'project',
        entityId: projects[0].id,
        action: 'created',
        changes: {
          projectName: 'AI Customer Support Agent',
          status: 'ACTIVE',
        },
      },
    }),
    prisma.activityLog.create({
      data: {
        userId: adminUser.id,
        entityType: 'project',
        entityId: projects[0].id,
        action: 'updated',
        changes: {
          progressPercentage: { from: 35, to: 45 },
        },
      },
    }),
    prisma.activityLog.create({
      data: {
        userId: adminUser.id,
        entityType: 'client',
        entityId: clients[0].id,
        action: 'created',
        changes: {
          companyName: 'TechCorp Solutions',
        },
      },
    }),
  ]);

  console.log('✅ Created activity logs');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - Users: ${teamUsers.length + 1} (1 admin + ${teamUsers.length} team members)`);
  console.log(`   - Team Members: ${teamMembers.length}`);
  console.log(`   - Clients: ${clients.length}`);
  console.log(`   - Projects: ${projects.length}`);
  console.log(`   - Meetings: ${meetings.length}`);
  console.log('');
  console.log('🔐 Login Credentials:');
  console.log('   Email: admin@aiagency.com');
  console.log('   Password: (will be set up with Better Auth)');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
