/**
 * @file dependencies.js
 * @description Dependency Injection (DI) container initialization for the Analytics module.
 * Assembles necessary repositories, services, and controllers cleanly.
 */

import clientRepository from '../../client/repository/ClientRepository.js';
import processorContainer from '../../processor/Dependencies/dependencies.js';
import authContainer from '../../auth/Dependencies/dependencies.js';

import { AnalyticsService } from '../services/analyticService.js';
import { AnalyticsController } from '../controller/analyticsController.js';

/**
 * Container initializer for the Analytics module.
 * Provides consistent access to repositories, services, and controllers.
 */
class Container {
    /**
     * Bootstraps the module instances.
     * Hooks clientRepository, metricsRepository from Processor module, and authService from Auth module.
     */
    static init() {
        const repositories = {
            clientRepository,
            metricsRepository: processorContainer.repositories.metricsRepository,
            apiHitRepository: processorContainer.repositories.apiHitRepository,
        };

        const analyticsService = new AnalyticsService(repositories.metricsRepository, repositories.apiHitRepository);

        const services = {
            analyticsService,
            authService: authContainer.services && authContainer.services.authService,
        };

        const analyticsController = new AnalyticsController({
            analyticsService: services.analyticsService,
            authService: services.authService,
            clientRepository: repositories.clientRepository,
        });

        const controllers = {
            analyticsController,
        };

        return { repositories, services, controllers };
    }
}

const initialized = Container.init();
export { Container };
export default initialized;