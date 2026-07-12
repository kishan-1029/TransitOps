export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'TransitOps API',
    version: '1.0.0',
    description: 'API Documentation for TransitOps - Smart Transport Operations Platform',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Role: {
        type: 'string',
        enum: ['FLEET_MANAGER', 'DRIVER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
      },
      VehicleType: {
        type: 'string',
        enum: ['Van', 'Truck', 'Mini'],
      },
      VehicleStatus: {
        type: 'string',
        enum: ['Available', 'OnTrip', 'InShop', 'Retired'],
      },
      DriverStatus: {
        type: 'string',
        enum: ['Available', 'OnTrip', 'OffDuty', 'Suspended'],
      },
      TripStatus: {
        type: 'string',
        enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
      },
      MaintenanceStatus: {
        type: 'string',
        enum: ['Active', 'Completed'],
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { $ref: '#/components/schemas/Role' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Vehicle: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          regNo: { type: 'string' },
          name: { type: 'string' },
          type: { $ref: '#/components/schemas/VehicleType' },
          capacityKg: { type: 'number' },
          odometer: { type: 'integer' },
          acquisitionCost: { type: 'number' },
          status: { $ref: '#/components/schemas/VehicleStatus' },
          region: { type: 'string' },
          revenue: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Driver: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          licenseNo: { type: 'string' },
          licenseCategory: { type: 'string' },
          licenseExpiry: { type: 'string', format: 'date-time' },
          contact: { type: 'string' },
          safetyScore: { type: 'number' },
          tripCompletion: { type: 'number' },
          status: { $ref: '#/components/schemas/DriverStatus' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Trip: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          tripCode: { type: 'string' },
          source: { type: 'string' },
          destination: { type: 'string' },
          cargoWeight: { type: 'number' },
          plannedDistance: { type: 'number' },
          status: { $ref: '#/components/schemas/TripStatus' },
          etaMinutes: { type: 'integer', nullable: true },
          finalOdometer: { type: 'integer', nullable: true },
          fuelConsumed: { type: 'number', nullable: true },
          cancelReason: { type: 'string', nullable: true },
          vehicleId: { type: 'string' },
          driverId: { type: 'string' },
          createdById: { type: 'string', nullable: true },
          dispatchedAt: { type: 'string', format: 'date-time', nullable: true },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
          cancelledAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      MaintenanceLog: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          vehicleId: { type: 'string' },
          serviceType: { type: 'string' },
          cost: { type: 'number' },
          date: { type: 'string', format: 'date-time' },
          status: { $ref: '#/components/schemas/MaintenanceStatus' },
          notes: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      FuelLog: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          vehicleId: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          liters: { type: 'number' },
          cost: { type: 'number' },
          tripId: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Expense: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          tripId: { type: 'string', nullable: true },
          vehicleId: { type: 'string' },
          toll: { type: 'number' },
          other: { type: 'number' },
          maintenanceLinked: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Setting: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          depotName: { type: 'string' },
          currency: { type: 'string' },
          distanceUnit: { type: 'string' },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/api/health': {
      get: {
        summary: 'Check API Health',
        security: [],
        responses: {
          200: {
            description: 'API is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    isOk: { type: 'boolean' },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        ts: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'User Login',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'fleet@transitops.in' },
                  password: { type: 'string', example: 'Password@123' },
                  role: { $ref: '#/components/schemas/Role' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Authentication successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        token: { type: 'string' },
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid validation input' },
          401: { description: 'Invalid credentials' },
          403: { description: 'Account locked' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get Authenticated User Details',
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/vehicles': {
      get: {
        summary: 'List Vehicles',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Vehicle type' },
          { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Vehicle status' },
          { name: 'region', in: 'query', schema: { type: 'string' }, description: 'Vehicle region' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term for name or registration' },
          { name: 'forDispatch', in: 'query', schema: { type: 'boolean' }, description: 'Only return available vehicles' },
        ],
        responses: {
          200: {
            description: 'List of vehicles',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Vehicle' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create Vehicle',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['regNo', 'name', 'type', 'capacityKg', 'acquisitionCost'],
                properties: {
                  regNo: { type: 'string' },
                  name: { type: 'string' },
                  type: { $ref: '#/components/schemas/VehicleType' },
                  capacityKg: { type: 'number' },
                  acquisitionCost: { type: 'number' },
                  odometer: { type: 'integer' },
                  status: { $ref: '#/components/schemas/VehicleStatus' },
                  region: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Vehicle created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Vehicle' },
                  },
                },
              },
            },
          },
          409: { description: 'Registration number already exists' },
        },
      },
    },
    '/api/vehicles/{id}': {
      get: {
        summary: 'Get Vehicle by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Vehicle details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Vehicle' },
                  },
                },
              },
            },
          },
          404: { description: 'Vehicle not found' },
        },
      },
      patch: {
        summary: 'Update Vehicle',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  regNo: { type: 'string' },
                  name: { type: 'string' },
                  type: { $ref: '#/components/schemas/VehicleType' },
                  capacityKg: { type: 'number' },
                  acquisitionCost: { type: 'number' },
                  status: { $ref: '#/components/schemas/VehicleStatus' },
                  region: { type: 'string' },
                  odometer: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Vehicle updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Vehicle' },
                  },
                },
              },
            },
          },
          404: { description: 'Vehicle not found' },
        },
      },
      delete: {
        summary: 'Delete Vehicle',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Vehicle deleted',
          },
          404: { description: 'Vehicle not found' },
        },
      },
    },
    '/api/drivers': {
      get: {
        summary: 'List Drivers',
        responses: {
          200: {
            description: 'List of drivers',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Driver' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create Driver',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'licenseNo', 'licenseCategory', 'licenseExpiry', 'contact'],
                properties: {
                  name: { type: 'string' },
                  licenseNo: { type: 'string' },
                  licenseCategory: { type: 'string' },
                  licenseExpiry: { type: 'string', format: 'date' },
                  contact: { type: 'string' },
                  status: { $ref: '#/components/schemas/DriverStatus' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Driver created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Driver' },
                  },
                },
              },
            },
          },
          409: { description: 'License number already exists' },
        },
      },
    },
    '/api/drivers/{id}': {
      patch: {
        summary: 'Update Driver',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  licenseCategory: { type: 'string' },
                  licenseExpiry: { type: 'string', format: 'date' },
                  contact: { type: 'string' },
                  status: { $ref: '#/components/schemas/DriverStatus' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Driver updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Driver' },
                  },
                },
              },
            },
          },
          404: { description: 'Driver not found' },
        },
      },
      delete: {
        summary: 'Delete Driver',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Driver deleted',
          },
          404: { description: 'Driver not found' },
        },
      },
    },
    '/api/trips': {
      get: {
        summary: 'List Trips',
        responses: {
          200: {
            description: 'List of trips',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Trip' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create Trip',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tripCode', 'source', 'destination', 'cargoWeight', 'plannedDistance', 'vehicleId', 'driverId'],
                properties: {
                  tripCode: { type: 'string' },
                  source: { type: 'string' },
                  destination: { type: 'string' },
                  cargoWeight: { type: 'number' },
                  plannedDistance: { type: 'number' },
                  vehicleId: { type: 'string' },
                  driverId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Trip created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Trip' },
                  },
                },
              },
            },
          },
          409: { description: 'Trip code already exists' },
        },
      },
    },
    '/api/trips/dispatch-options': {
      get: {
        summary: 'Get Available Vehicles and Drivers for Dispatch',
        responses: {
          200: {
            description: 'Available resources',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        vehicles: { type: 'array', items: { $ref: '#/components/schemas/Vehicle' } },
                        drivers: { type: 'array', items: { $ref: '#/components/schemas/Driver' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/trips/{id}/dispatch': {
      post: {
        summary: 'Dispatch Trip',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Trip dispatched successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Trip' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/trips/{id}/complete': {
      post: {
        summary: 'Complete Trip',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['finalOdometer', 'fuelConsumed'],
                properties: {
                  finalOdometer: { type: 'integer' },
                  fuelConsumed: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Trip completed successfully',
          },
        },
      },
    },
    '/api/trips/{id}/cancel': {
      post: {
        summary: 'Cancel Trip',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['cancelReason'],
                properties: {
                  cancelReason: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Trip cancelled successfully',
          },
        },
      },
    },
    '/api/maintenance': {
      get: {
        summary: 'List Maintenance Logs',
        responses: {
          200: {
            description: 'List of logs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/MaintenanceLog' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create Maintenance Log',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['vehicleId', 'serviceType', 'cost'],
                properties: {
                  vehicleId: { type: 'string' },
                  serviceType: { type: 'string' },
                  cost: { type: 'number' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Maintenance log created',
          },
        },
      },
    },
    '/api/maintenance/{id}/close': {
      post: {
        summary: 'Close Maintenance Log',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Maintenance log closed',
          },
        },
      },
    },
    '/api/fuel/logs': {
      get: {
        summary: 'List Fuel Logs',
        responses: {
          200: {
            description: 'List of fuel logs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/FuelLog' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create Fuel Log',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['vehicleId', 'liters', 'cost'],
                properties: {
                  vehicleId: { type: 'string' },
                  liters: { type: 'number' },
                  cost: { type: 'number' },
                  tripId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Fuel log created',
          },
        },
      },
    },
    '/api/fuel/expenses': {
      get: {
        summary: 'List Expenses',
        responses: {
          200: {
            description: 'List of expenses',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Expense' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create Expense',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['vehicleId', 'toll', 'other'],
                properties: {
                  vehicleId: { type: 'string' },
                  toll: { type: 'number' },
                  other: { type: 'number' },
                  tripId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Expense created',
          },
        },
      },
    },
    '/api/fuel/operational-cost': {
      get: {
        summary: 'Get Total Operational Cost Stats',
        responses: {
          200: {
            description: 'Operational costs summary data',
          },
        },
      },
    },
    '/api/search': {
      get: {
        summary: 'Global Search',
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Search term' },
        ],
        responses: {
          200: {
            description: 'Search results matching vehicles, drivers, or trips',
          },
        },
      },
    },
    '/api/chat': {
      post: {
        summary: 'Send a Message to the AI Copilot Chat',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { type: 'string', example: 'What is the highest-revenue vehicle?' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'AI response message',
          },
        },
      },
    },
    '/api/dashboard/kpis': {
      get: {
        summary: 'Get Dashboard Key Performance Indicators',
        responses: {
          200: {
            description: 'KPI values',
          },
        },
      },
    },
    '/api/analytics/summary': {
      get: {
        summary: 'Get Analytics Summary Chart Data',
        responses: {
          200: {
            description: 'Chart and metric aggregations',
          },
        },
      },
    },
    '/api/settings': {
      get: {
        summary: 'Get Application Settings',
        responses: {
          200: {
            description: 'Current settings',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Setting' },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Update Application Settings',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  depotName: { type: 'string' },
                  currency: { type: 'string' },
                  distanceUnit: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Settings updated',
          },
        },
      },
    },
  },
};
