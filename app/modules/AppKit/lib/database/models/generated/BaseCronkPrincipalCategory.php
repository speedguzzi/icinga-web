<?php
// {{{ICINGA_LICENSE_CODE}}}
// -----------------------------------------------------------------------------
// This file is part of icinga-web.
// 
// Copyright (c) 2009-2012 Icinga Developer Team.
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

Doctrine_Manager::getInstance()->bindComponent('CronkPrincipalCategory', 'icinga_web');

/**
 * BaseCronkPrincipalCronk
 *
 * This class has been auto-generated by the Doctrine ORM Framework
 *
 * @property integer $principal_id
 * @property integer $category_id
 * @property NsmPrincipal $NsmPrincipal
 * @property NsmPrincipal $principal
 * @property CronkCategory $category
 *
 * @package    IcingaWeb
 * @subpackage AppKit
 * @author     Icinga Development Team <info@icinga.org>
 * @version    SVN: $Id: Builder.php 7490 2010-03-29 19:53:27Z jwage $
 */
abstract class BaseCronkPrincipalCategory extends Doctrine_Record {
    public function setTableDefinition() {
        $this->setTableName('cronk_principal_category');
        $this->hasColumn('principal_id', 'integer', 4, array(
                             'type' => 'integer',
                             'length' => 4,
                             'fixed' => false,
                             'unsigned' => false,
                             'primary' => true,
                             'autoincrement' => false,
                         ));
        $this->hasColumn('category_id', 'integer', 4, array(
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
                          'local' => 'principal_id',
                          'foreign' => 'principal_id'));
        
        $this->hasOne('NsmPrincipal as principal', array(
                'local' => 'principal_id',
                'foreign' => 'principal_id'));
        
        $this->hasOne('CronkCategory', array(
                'local' => 'category_id',
                'foreign' => 'cc_id'));
        
        $this->hasOne('CronkCategory as category', array(
                'local' => 'category_id',
                'foreign' => 'cc_id'));
    }
}
