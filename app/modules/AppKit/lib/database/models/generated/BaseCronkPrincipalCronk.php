<?php
// {{{ICINGA_LICENSE_CODE}}}
// -----------------------------------------------------------------------------
// This file is part of icinga-web.
// 
// Copyright (c) 2009-2013 Icinga Developer Team.
// All rights reserved.
// 
// icinga-web is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// icinga-web is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with icinga-web.  If not, see <http://www.gnu.org/licenses/>.
// -----------------------------------------------------------------------------
// {{{ICINGA_LICENSE_CODE}}}

Doctrine_Manager::getInstance()->bindComponent('CronkPrincipalCronk', 'icinga_web');

/**
 * BaseCronkPrincipalCronk
 *
 * This class has been auto-generated by the Doctrine ORM Framework
 *
 * @property integer $cpc_principal_id
 * @property integer $cpc_cronk_id
 * @property NsmPrincipal $NsmPrincipal
 * @property Cronk $Cronk
 *
 * @package    IcingaWeb
 * @subpackage AppKit
 * @author     Icinga Development Team <info@icinga.org>
 * @version    SVN: $Id: Builder.php 7490 2010-03-29 19:53:27Z jwage $
 */
abstract class BaseCronkPrincipalCronk extends Doctrine_Record {
    public function setTableDefinition() {
        $this->setTableName('cronk_principal_cronk');
        $this->hasColumn('cpc_principal_id', 'integer', 4, array(
                             'type' => 'integer',
                             'length' => 4,
                             'fixed' => false,
                             'unsigned' => false,
                             'primary' => true,
                             'autoincrement' => false,
                         ));
        $this->hasColumn('cpc_cronk_id', 'integer', 4, array(
                             'type' => 'integer',
                             'length' => 4,
                             'fixed' => false,
                             'unsigned' => false,
                             'primary' => true,
                             'autoincrement' => false,
                         ));
    }

    public function setUp() {
        parent::setUp();
        $this->hasOne('NsmPrincipal', array(
                          'local' => 'cpc_principal_id',
                          'foreign' => 'principal_id'));
        
        $this->hasOne('NsmPrincipal as principal', array(
                'local' => 'cpc_principal_id',
                'foreign' => 'principal_id'));

        $this->hasOne('Cronk', array(
                          'local' => 'cpc_cronk_id',
                          'foreign' => 'cronk_id'));
    }
}
