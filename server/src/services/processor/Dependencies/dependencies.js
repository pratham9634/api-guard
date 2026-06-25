/**
 * @file dependencies.js
 * @description Dependency injection container for the Processor microservice.
 * Instantiates the API hit repository (MongoDB), metrics repository (PostgreSQL),
 * and links them with the core ProcessorService instance.
 */

import { ApiHitRepository } from "../repository/ApiHitRepository.js";
import { MetricsRepository } from "../repository/MetricsRepository.js";
import { ProcessorService } from "../service/ProcessorService.js";

import ApiHit from '../../../shared/models/ApiHits.js';
import postgres from '../../../shared/config/postgres.js';
import logger from '../../../shared/config/logger.js';

/**
 * Dependency container class containing repository and service maps.
 */
class Container {
    /**
     * Initializes core database repositories and the event processing service.
     * 
     * @returns {Object} Instantiated maps containing repository and service entities.
     */
    static init() {
        const repositories = {
            apiHitRepository: new ApiHitRepository({ model: ApiHit, logger }),
            metricsRepository: new MetricsRepository({ logger, postgres }),
        };

        const services = {
            processorService: new ProcessorService(repositories),
        };

        return { repositories, services }
    }
}


const initialized = Container.init();
export { Container };
export default initialized;