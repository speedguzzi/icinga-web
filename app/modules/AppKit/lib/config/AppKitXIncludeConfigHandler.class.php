<?php

/**
 * AppKitXIncludeConfigHandler includes module configuration files into their global equivalent respectively
 * @author Eric Lippmann <eric.lippmann@netways.de>
 * @since 1.5.0
 */
class AppKitXIncludeConfigHandler extends AgaviXmlConfigHandler {

    /**
     * AgaviConfig format string identifying includes
     * @var string
     *
     * @param string module
     * @param string include namespace
     */
    const INCLUDE_FMT = 'modules.%s.agavi.include.%s';

    /**
     * (non-PHPdoc)
     * @see AgaviIXmlConfigHandler::execute()
     */
    public function execute(AgaviXmlConfigDomDocument $document) {

        $config = basename($document->baseURI, '.xml');

        $refClass = $this->getConfigHandlerClass($config);

        $configHandler = $refClass->newInstance();

        $configHandler->initialize($this->context, $this->parameters);

        $nsprefix = null;

        if ($refClass->hasConstant('XML_NAMESPACE')) {

            $m = array();
            preg_match('/\/([a-z]+)\/[^\/]+$/', $refClass->getConstant('XML_NAMESPACE'), $m);
            $nsprefix = $m[1];

            $document->setDefaultNamespace($refClass->getConstant('XML_NAMESPACE'), $nsprefix);
        } else {
            throw new AgaviConfigurationException('Could not read XML_NAMESPACE from class: '. $refClass->getName());
        }

        // Order of includes is essential because of dependencies
        $modules = array_merge(
                       array('AppKit'),
                       AgaviConfig::get('org.icinga.appkit.init_modules')
                   );

        $query = $this->getQuery();

        $pointers = $this->getPointers();

        foreach($modules as $module) {
            $includes = AgaviConfig::get(
                            sprintf(
                                self::INCLUDE_FMT,
                                strtolower($module),
                                $this->getParameter('includeNS', $config)
                            ),
                            false
                        );
            
            if ($includes) {

                foreach($pointers as $pointer) {
                    AppKitXmlUtil::includeXmlFilesToTarget(
                        $document,
                        $query,
                        $pointer,
                        $includes
                    );

                    try {
                        $document->xinclude();
                    } catch (Exception $e) {

                    }
                }
            }
        }

        // The confighandler behind this included definition
        return $configHandler->execute($document);
    }

    /**
     * Returns the right config handler
     * @param string $config
     * @throws AgaviConfigurationException
     * @return ReflectionClass
     */
    private function getConfigHandlerClass($config) {
        // For Agavi configuration files we call their appropriate handlers
        // else we hopefully have a handler defined
        if (false == ($configHandlerClass = $this->getParameter('handler', false))) {
            switch ($config) {
                case 'databases':
                    $config = 'database';
                    break;
            }

            $configHandlerClass = sprintf('Agavi%sConfigHandler', ucfirst($config));
        }

        if (!class_exists($configHandlerClass)) {
            throw new AgaviConfigurationException("$configHandlerClass not found.");
        }

        $ref = new ReflectionClass($configHandlerClass);
        return $ref;
    }

    /**
     * Returns the XPath query and substitude some vars needed there
     * @return string
     */
    private function getQuery() {
        $query = $this->getParameter('query');

        // Allow different contexts in xpath queries and
        // substitude the variable
        if (strpos($query, '__CONTEXT__') !== false) {
            $query = str_replace('__CONTEXT__', AgaviConfig::get('core.default_context', 'web'), $query);
        }

        return $query;
    }

    /**
     * Returns an array of xpointer to include from
     * @return array
     */
    private function getPointers() {
        $pointers = $this->getParameter('pointer');

        if (!is_array($pointers)) {
            $pointers = array($pointers);
        }

        return $pointers;
    }

}