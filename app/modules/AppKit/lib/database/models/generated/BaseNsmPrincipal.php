<?php
/**
 * BaseNsmPrincipal
 * 
 * This class has been auto-generated by the Doctrine ORM Framework
 * 
 * @property integer $principal_id
 * @property integer $principal_user_id
 * @property integer $principal_role_id
 * @property string $principal_type
 * @property integer $principal_disabled
 * @property NsmUser $NsmUser
 * @property NsmRole $NsmRole
 * @property Doctrine_Collection $NsmPrincipalTarget
 * 
 * @package    ##PACKAGE##
 * @subpackage ##SUBPACKAGE##
 * @author     ##NAME## <##EMAIL##>
 * @version    SVN: $Id: Builder.php 7490 2010-03-29 19:53:27Z jwage $
 */
abstract class BaseNsmPrincipal extends Doctrine_Record
{
	
    public function setTableDefinition()
    {
        $this->setTableName('nsm_principal');
        $this->hasColumn('principal_id', 'integer', 4, array(
             'type' => 'integer',
             'length' => 4,
             'fixed' => false,
             'unsigned' => false,
             'primary' => true,
             'autoincrement' => true,
             ));
        $this->hasColumn('principal_user_id', 'integer', 4, array(
             'type' => 'integer',
             'length' => 4,
             'fixed' => false,
             'unsigned' => false,
             'primary' => false,
             'notnull' => false,
             'autoincrement' => false,
             ));
        $this->hasColumn('principal_role_id', 'integer', 4, array(
             'type' => 'integer',
             'length' => 4,
             'fixed' => false,
             'unsigned' => false,
             'primary' => false,
             'notnull' => false,
             'autoincrement' => false,
             ));
        $this->hasColumn('principal_type', 'string', 4, array(
             'type' => 'string',
             'length' => 4,
             'fixed' => false,
             'unsigned' => false,
             'primary' => false,
             'notnull' => true,
             'autoincrement' => false,
             ));
        $this->hasColumn('principal_disabled', 'integer', 1, array(
             'type' => 'integer',
             'length' => 1,
             'fixed' => false,
             'unsigned' => false,
             'primary' => false,
             'default' => '0',
             'notnull' => false,
             'autoincrement' => false,
             ));
             
    //   $this->index('principal_user_id_ix', array('fields'=>array('principal_user_id')));
    //   $this->index('principal_role_id_ix', array('fields'=>array('principal_role_id')));
    }

    public function setUp()
    {
        parent::setUp();
        $this->hasOne('NsmUser', array(
             'local' => 'principal_user_id',
             'foreign' => 'user_id',
           	 'onDelete' => 'CASCADE',
        	 'onUpdate' => 'CASCADE'));

        $this->hasOne('NsmRole', array(
             'local' => 'principal_role_id',
             'foreign' => 'role_id',
           	 'onDelete' => 'CASCADE',
        	 'onUpdate' => 'CASCADE'));

        $this->hasMany('NsmPrincipalTarget', array(
             'local' => 'principal_id',
             'foreign' => 'pt_principal_id'));
    }
    
    public static function getInitialData() {
		return array(
			array('principal_id'=>'1','principal_user_id'=>'1','principal_type'=>'user','principal_disabled'=>'0'),
			array('principal_id'=>'2','principal_role_id'=>'2','principal_type'=>'role','principal_disabled'=>'0'),
			array('principal_id'=>'3','principal_role_id'=>'3','principal_type'=>'role','principal_disabled'=>'0'),
			array('principal_id'=>'4','principal_role_id'=>'1','principal_type'=>'role','principal_disabled'=>'0'),
			array('principal_id'=>'5','principal_role_id'=>'4','principal_type'=>'role','principal_disabled'=>'0')				
		);
    }
    
    public static function getPgsqlSequenceOffsets() {
    	return array("nsm_principal_principal_id_seq" => 6);
    }
}