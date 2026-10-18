import { PrismaClient, AlertSeverity, AlertStatus, PredictionStatus, MaintenanceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.sensorReading.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.maintenanceTask.deleteMany();
  await prisma.sensor.deleteMany();
  await prisma.machine.deleteMany();
  await prisma.systemLog.deleteMany();
  await prisma.operatorNumber.deleteMany();
  await prisma.user.deleteMany();

  // Create Users with hashed passwords
  console.log('👥 Creating users...');
  const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || 'seed-default-local-password';
  const adminPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || defaultPassword, 10);
  const managerPassword = await bcrypt.hash(process.env.SEED_MANAGER_PASSWORD || defaultPassword, 10);
  const technicianPassword = await bcrypt.hash(process.env.SEED_TECH_PASSWORD || defaultPassword, 10);
  const operatorPassword = await bcrypt.hash(process.env.SEED_OPERATOR_PASSWORD || defaultPassword, 10);


  const admin = await prisma.user.create({
    data: {
      email: 'admin@octopus.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      department: 'Management',
      isActive: true,
      lastLogin: new Date(),
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@octopus.com',
      password: managerPassword,
      name: 'Sarah Manager',
      role: 'MANAGER',
      department: 'Operations',
      isActive: true,
      lastLogin: new Date(),
      createdById: admin.id,
    },
  });

  const technician = await prisma.user.create({
    data: {
      email: 'tech@octopus.com',
      password: technicianPassword,
      name: 'Mike Technician',
      role: 'TECHNICIAN',
      department: 'Maintenance',
      operatorNumber: 'TECH-001',
      machineGroup: 'Group A',
      isActive: true,
      lastLogin: new Date(),
      createdById: admin.id,
    },
  });

  const operator1 = await prisma.user.create({
    data: {
      email: 'operator@octopus.com',
      password: operatorPassword,
      name: 'John Operator',
      role: 'OPERATOR',
      department: 'Production',
      operatorNumber: 'OP-001',
      machineGroup: 'Group A',
      isActive: true,
      lastLogin: new Date(),
      createdById: admin.id,
    },
  });

  console.log(`✅ Created ${4} users`);

  // Create Operator Numbers
  console.log('🔢 Creating operator numbers...');
  const operatorNumbers = [];
  for (let i = 4; i <= 20; i++) {
    operatorNumbers.push({
      number: `OP-${String(i).padStart(3, '0')}`,
      isAssigned: false,
    });
  }
  await prisma.operatorNumber.createMany({ data: operatorNumbers });
  console.log(`✅ Created ${operatorNumbers.length} operator numbers`);

  // Create Machines
  console.log('🏭 Creating machines...');
  const machine1 = await prisma.machine.create({
    data: {
      name: 'CNC Machine Alpha',
      type: 'CNC Mill',
      model: 'Haas VF-2',
      serialNumber: 'CNC-2024-001',
      location: 'Production Floor A',
      department: 'Production',
      machineGroup: 'Group A',
      status: 'HEALTHY',
      healthScore: 95,
      installDate: new Date('2023-01-15'),
      lastMaintenance: new Date('2024-04-01'),
      nextMaintenance: new Date('2024-07-01'),
    },
  });

  const machine2 = await prisma.machine.create({
    data: {
      name: 'Hydraulic Press Beta',
      type: 'Hydraulic Press',
      model: 'HP-5000',
      serialNumber: 'HP-2024-002',
      location: 'Production Floor B',
      department: 'Production',
      machineGroup: 'Group B',
      status: 'WARNING',
      healthScore: 72,
      installDate: new Date('2022-06-20'),
      lastMaintenance: new Date('2024-03-15'),
      nextMaintenance: new Date('2024-06-15'),
    },
  });

  const machine3 = await prisma.machine.create({
    data: {
      name: 'Lathe Machine Gamma',
      type: 'Lathe',
      model: 'DMG MORI NLX',
      serialNumber: 'LT-2024-003',
      location: 'Production Floor A',
      department: 'Production',
      machineGroup: 'Group A',
      status: 'CRITICAL',
      healthScore: 45,
      installDate: new Date('2021-03-10'),
      lastMaintenance: new Date('2024-02-20'),
      nextMaintenance: new Date('2024-05-20'),
    },
  });

  const machine4 = await prisma.machine.create({
    data: {
      name: 'Welding Robot Delta',
      type: 'Robotic Welder',
      model: 'FANUC ARC Mate',
      serialNumber: 'WR-2024-004',
      location: 'Assembly Line 1',
      department: 'Assembly',
      machineGroup: 'Group B',
      status: 'HEALTHY',
      healthScore: 88,
      installDate: new Date('2023-08-05'),
      lastMaintenance: new Date('2024-04-10'),
      nextMaintenance: new Date('2024-07-10'),
    },
  });

  const machine5 = await prisma.machine.create({
    data: {
      name: 'Conveyor System Epsilon',
      type: 'Conveyor Belt',
      model: 'CB-3000',
      serialNumber: 'CB-2024-005',
      location: 'Warehouse',
      department: 'Logistics',
      machineGroup: 'Group C',
      status: 'OFFLINE',
      healthScore: 0,
      installDate: new Date('2020-11-30'),
      lastMaintenance: new Date('2024-01-15'),
      nextMaintenance: new Date('2024-04-15'),
    },
  });

  console.log(`✅ Created ${5} machines`);

  // Create Sensors
  console.log('📡 Creating sensors...');
  const sensors = [
    // Machine 1 sensors
    {
      machineId: machine1.id,
      name: 'Temperature Sensor',
      type: 'Temperature',
      unit: '°C',
      minValue: 0,
      maxValue: 150,
      thresholdMin: 20,
      thresholdMax: 80,
      isActive: true,
      batteryLevel: 95,
      lastReading: new Date(),
    },
    {
      machineId: machine1.id,
      name: 'Vibration Sensor',
      type: 'Vibration',
      unit: 'mm/s',
      minValue: 0,
      maxValue: 50,
      thresholdMin: 0,
      thresholdMax: 15,
      isActive: true,
      batteryLevel: 92,
      lastReading: new Date(),
    },
    {
      machineId: machine1.id,
      name: 'Pressure Sensor',
      type: 'Pressure',
      unit: 'bar',
      minValue: 0,
      maxValue: 200,
      thresholdMin: 50,
      thresholdMax: 150,
      isActive: true,
      batteryLevel: 88,
      lastReading: new Date(),
    },
    // Machine 2 sensors
    {
      machineId: machine2.id,
      name: 'Temperature Sensor',
      type: 'Temperature',
      unit: '°C',
      minValue: 0,
      maxValue: 150,
      thresholdMin: 20,
      thresholdMax: 90,
      isActive: true,
      batteryLevel: 78,
      lastReading: new Date(),
    },
    {
      machineId: machine2.id,
      name: 'Hydraulic Pressure',
      type: 'Pressure',
      unit: 'bar',
      minValue: 0,
      maxValue: 300,
      thresholdMin: 100,
      thresholdMax: 250,
      isActive: true,
      batteryLevel: 85,
      lastReading: new Date(),
    },
    // Machine 3 sensors
    {
      machineId: machine3.id,
      name: 'Spindle Temperature',
      type: 'Temperature',
      unit: '°C',
      minValue: 0,
      maxValue: 200,
      thresholdMin: 30,
      thresholdMax: 120,
      isActive: true,
      batteryLevel: 45,
      lastReading: new Date(),
    },
    {
      machineId: machine3.id,
      name: 'Vibration Monitor',
      type: 'Vibration',
      unit: 'mm/s',
      minValue: 0,
      maxValue: 60,
      thresholdMin: 0,
      thresholdMax: 20,
      isActive: true,
      batteryLevel: 52,
      lastReading: new Date(),
    },
    // Machine 4 sensors
    {
      machineId: machine4.id,
      name: 'Arc Temperature',
      type: 'Temperature',
      unit: '°C',
      minValue: 0,
      maxValue: 500,
      thresholdMin: 100,
      thresholdMax: 400,
      isActive: true,
      batteryLevel: 90,
      lastReading: new Date(),
    },
    {
      machineId: machine4.id,
      name: 'Current Sensor',
      type: 'Current',
      unit: 'A',
      minValue: 0,
      maxValue: 300,
      thresholdMin: 50,
      thresholdMax: 250,
      isActive: true,
      batteryLevel: 87,
      lastReading: new Date(),
    },
    // Machine 5 sensors
    {
      machineId: machine5.id,
      name: 'Motor Temperature',
      type: 'Temperature',
      unit: '°C',
      minValue: 0,
      maxValue: 120,
      thresholdMin: 20,
      thresholdMax: 85,
      isActive: false,
      batteryLevel: 15,
      lastReading: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ];

  const createdSensors = await Promise.all(
    sensors.map((sensor) => prisma.sensor.create({ data: sensor }))
  );
  console.log(`✅ Created ${createdSensors.length} sensors`);

  // Create Sensor Readings
  console.log('📊 Creating sensor readings...');
  const readings = [];
  for (const sensor of createdSensors.slice(0, 5)) {
    // Create 20 readings per sensor
    for (let i = 0; i < 20; i++) {
      const timestamp = new Date(Date.now() - i * 60 * 60 * 1000); // Every hour
      let value;
      
      if (sensor.type === 'Temperature') {
        value = 40 + Math.random() * 30;
      } else if (sensor.type === 'Vibration') {
        value = 5 + Math.random() * 10;
      } else if (sensor.type === 'Pressure') {
        value = 100 + Math.random() * 50;
      } else if (sensor.type === 'Current') {
        value = 100 + Math.random() * 100;
      } else {
        value = Math.random() * 100;
      }

      readings.push({
        sensorId: sensor.id,
        value: parseFloat(value.toFixed(2)),
        timestamp,
      });
    }
  }
  await prisma.sensorReading.createMany({ data: readings });
  console.log(`✅ Created ${readings.length} sensor readings`);

  // Create Alerts
  console.log('🚨 Creating alerts...');
  const alert1 = await prisma.alert.create({
    data: {
      machineId: machine2.id,
      severity: AlertSeverity.WARNING,
      status: AlertStatus.ACTIVE,
      title: 'High Temperature Detected',
      message: 'Temperature sensor reading 85°C, approaching threshold of 90°C',
      sensorType: 'Temperature',
      value: 85,
      threshold: 90,
    },
  });

  const alert2 = await prisma.alert.create({
    data: {
      machineId: machine3.id,
      severity: AlertSeverity.CRITICAL,
      status: AlertStatus.ACTIVE,
      title: 'Critical Vibration Level',
      message: 'Vibration levels at 25 mm/s, exceeding safe threshold of 20 mm/s',
      sensorType: 'Vibration',
      value: 25,
      threshold: 20,
    },
  });

  const alert3 = await prisma.alert.create({
    data: {
      machineId: machine3.id,
      severity: AlertSeverity.CRITICAL,
      status: AlertStatus.ACKNOWLEDGED,
      title: 'Low Battery Warning',
      message: 'Sensor battery level at 45%, requires replacement soon',
      sensorType: 'Battery',
      value: 45,
      threshold: 50,
      acknowledgedBy: operator1.id,
      acknowledgedAt: new Date(),
    },
  });

  const alert4 = await prisma.alert.create({
    data: {
      machineId: machine5.id,
      severity: AlertSeverity.CRITICAL,
      status: AlertStatus.ACTIVE,
      title: 'Machine Offline',
      message: 'Conveyor system has been offline for 7 days',
      sensorType: 'Status',
      value: 0,
      threshold: 1,
    },
  });

  const alert5 = await prisma.alert.create({
    data: {
      machineId: machine1.id,
      severity: AlertSeverity.INFO,
      status: AlertStatus.RESOLVED,
      title: 'Maintenance Completed',
      message: 'Scheduled maintenance completed successfully',
      acknowledgedBy: admin.id,
      acknowledgedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });
  console.log(`✅ Created 5 alerts`);

  // Create Predictions
  console.log('🔮 Creating predictions...');
  const predictions = [
    {
      machineId: machine1.id,
      failureProbability: 0.15,
      rul: 180,
      riskScore: 25,
      confidence: 0.92,
      status: PredictionStatus.NORMAL,
      modelVersion: 'v2.1.0',
      nextPrediction: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      machineId: machine2.id,
      failureProbability: 0.45,
      rul: 60,
      riskScore: 65,
      confidence: 0.88,
      status: PredictionStatus.WARNING,
      modelVersion: 'v2.1.0',
      nextPrediction: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      machineId: machine3.id,
      failureProbability: 0.78,
      rul: 15,
      riskScore: 92,
      confidence: 0.95,
      status: PredictionStatus.CRITICAL,
      modelVersion: 'v2.1.0',
      nextPrediction: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      machineId: machine4.id,
      failureProbability: 0.22,
      rul: 120,
      riskScore: 35,
      confidence: 0.85,
      status: PredictionStatus.NORMAL,
      modelVersion: 'v2.1.0',
      nextPrediction: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      machineId: machine5.id,
      failureProbability: 0.95,
      rul: 0,
      riskScore: 100,
      confidence: 0.99,
      status: PredictionStatus.CRITICAL,
      modelVersion: 'v2.1.0',
      nextPrediction: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
  ];
  await prisma.prediction.createMany({ data: predictions });
  console.log(`✅ Created ${predictions.length} predictions`);

  // Create Maintenance Tasks
  console.log('🔧 Creating maintenance tasks...');
  const task1 = await prisma.maintenanceTask.create({
    data: {
      machineId: machine1.id,
      title: 'Routine Inspection',
      description: 'Quarterly inspection and lubrication of moving parts',
      type: 'PREVENTIVE',
      priority: 'MEDIUM',
      status: MaintenanceStatus.COMPLETED,
      scheduledDate: new Date('2024-04-01'),
      completedDate: new Date('2024-04-02'),
      assignedTo: operator1.id,
    },
  });

  const task2 = await prisma.maintenanceTask.create({
    data: {
      machineId: machine2.id,
      title: 'Temperature Sensor Calibration',
      description: 'Calibrate temperature sensor due to high readings',
      type: 'CORRECTIVE',
      priority: 'HIGH',
      status: MaintenanceStatus.IN_PROGRESS,
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      assignedTo: technician.id,
    },
  });

  const task3 = await prisma.maintenanceTask.create({
    data: {
      machineId: machine3.id,
      title: 'Emergency Bearing Replacement',
      description: 'Replace worn bearings causing excessive vibration',
      type: 'EMERGENCY',
      priority: 'CRITICAL',
      status: MaintenanceStatus.PENDING,
      scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      assignedTo: technician.id,
    },
  });

  const task4 = await prisma.maintenanceTask.create({
    data: {
      machineId: machine4.id,
      title: 'Welding Tip Replacement',
      description: 'Replace welding tips as part of scheduled maintenance',
      type: 'PREVENTIVE',
      priority: 'MEDIUM',
      status: MaintenanceStatus.PENDING,
      scheduledDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      assignedTo: operator1.id,
    },
  });

  const task5 = await prisma.maintenanceTask.create({
    data: {
      machineId: machine5.id,
      title: 'Complete System Overhaul',
      description: 'Full diagnostic and repair of conveyor system',
      type: 'EMERGENCY',
      priority: 'CRITICAL',
      status: MaintenanceStatus.PENDING,
      scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      assignedTo: technician.id,
    },
  });

  const task6 = await prisma.maintenanceTask.create({
    data: {
      machineId: machine1.id,
      title: 'Software Update',
      description: 'Update CNC control software to latest version',
      type: 'PREVENTIVE',
      priority: 'LOW',
      status: MaintenanceStatus.PENDING,
      scheduledDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      assignedTo: manager.id,
    },
  });
  console.log(`✅ Created 6 maintenance tasks`);

  // Create System Logs
  console.log('📝 Creating system logs...');
  const systemLogs = [
    {
      userId: admin.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: admin.id,
      details: 'Admin user logged in successfully',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      userId: operator1.id,
      action: 'ALERT_ACKNOWLEDGED',
      entityType: 'Alert',
      entityId: alert3.id,
      details: 'Acknowledged low battery warning for Machine Gamma',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      userId: admin.id,
      action: 'MACHINE_CREATED',
      entityType: 'Machine',
      entityId: machine1.id,
      details: 'Created new machine: CNC Machine Alpha',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      userId: technician.id,
      action: 'MAINTENANCE_UPDATED',
      entityType: 'MaintenanceTask',
      entityId: task2.id,
      details: 'Updated maintenance task status to IN_PROGRESS',
      ipAddress: '192.168.1.110',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      userId: admin.id,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: operator1.id,
      details: 'Created new operator: John Operator',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  ];
  await prisma.systemLog.createMany({ data: systemLogs });
  console.log(`✅ Created ${systemLogs.length} system logs`);

  console.log('\n✨ Database seeding completed successfully!\n');
  console.log('📋 Summary:');
  console.log(`   - Users: 4 (1 Admin, 1 Manager, 1 Technician, 1 Operator)`);
  console.log(`   - Machines: 5`);
  console.log(`   - Sensors: ${createdSensors.length}`);
  console.log(`   - Sensor Readings: ${readings.length}`);
  console.log(`   - Alerts: 5`);
  console.log(`   - Predictions: ${predictions.length}`);
  console.log(`   - Maintenance Tasks: 6`);
  console.log(`   - System Logs: ${systemLogs.length}`);
  console.log(`   - Operator Numbers: ${operatorNumbers.length + 2}`);
  console.log('\n🔐 Test Accounts Created:');
  console.log(`   Admin: admin@octopus.com (Password: ${process.env.SEED_ADMIN_PASSWORD || defaultPassword})`);
  console.log(`   Manager: manager@octopus.com (Password: ${process.env.SEED_MANAGER_PASSWORD || defaultPassword})`);
  console.log(`   Technician: tech@octopus.com (Password: ${process.env.SEED_TECH_PASSWORD || defaultPassword})`);
  console.log(`   Operator: operator@octopus.com (Password: ${process.env.SEED_OPERATOR_PASSWORD || defaultPassword})`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Made with Bob
