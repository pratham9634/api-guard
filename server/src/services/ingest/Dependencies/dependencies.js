/**
 * @file dependencies.js
 * @description Dependency injection container for the Ingest microservice.
 * Manages instantiation of event producers, services, and controllers to avoid circular dependencies.
 */

import { createEventProducer } from "../../../shared/events/producer/createEventProducer.js";
import { IngestController } from "../controller/ingestController.js";
import { IngestService } from "../services/ingestServices.js";

/**
 * Dependency Injection container class.
 */
class Container {
    
    /**
     * Initializes the service and controller instances for the ingest microservice.
     * Hooks up the RabbitMQ event producer to the ingest service.
     * 
     * @returns {Object} Object containing initialized service map and controller map.
     */
    static init() {
        const eventProducer = createEventProducer();

        const services = {
            ingestService: new IngestService({ eventProducer })
        }

        const controllers = {
            ingestController: new IngestController(services)
        }

        return { services, controllers }
    }
}

// Instantiate and export the bootstrap container components
const container = Container.init();
export default {
    ingestService: container.services.ingestService,
    ingestController: container.controllers.ingestController,
    Container
}