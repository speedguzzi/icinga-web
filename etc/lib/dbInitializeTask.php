<?php
/**
 * Task that sets up a database via doctrine Models
 * @author jmosshammer <jannis.mosshammer@netways.de>
 *
 */

require_once(dirname(__FILE__)."/doctrineTask.php");
class dbInitializeTask extends doctrineTask {
	public $insertedData = array();
	
	public function main() {
		parent::main();
		$this->createDB();
		$this->createTables();
		$this->insertInitData();
		
		
	}
	
	protected function createDB() {
		try {
			Doctrine::createDatabases();
		} catch(Exception $e) {
			//..ignore, the db already exists
		} 
	}
	
	protected function createTables() {
		try {
			Doctrine::createTablesFromModels(array(
				$this->modelPath."generated/",
				$this->modelPath."/"
				)
			);
		} catch(Doctrine_Exception $e) {
			throw new BuildException("Couldn't create schema - are you sure the table doesn't already exist? If so, use the update command.");
		}
	}
	
	protected function insertInitData() {
		/**
		 * yay, it's bruteforce inserting - try inserting the records $maxTries times or 
		 * until everything is inserted. If there are missing relations, just try it next time
		 **/ 
		$tries = 0;
		$maxTries = 15;
		$order = 0;
		do {	
			$allsaved = true;
	        foreach(Doctrine::getLoadedModels() as $model) {
				$refCl = new ReflectionClass($model);
				if(!$refCl->hasMethod("getInitialData")) 
					continue;
					
				foreach($model::getInitialData() as $initData) {
					$initData["_model_"] = $model;
					if(in_array(serialize($initData),$this->insertedData)) {
						continue;
					}
					$record = new $model();
					
					foreach($initData as $field=>$value) {
						if($field == '_model_')
							continue;
						$record->set($field,$value);
					}
					$result = false;
					try { 
						$result = $record->trySave();
					} catch(Exception $e) {/*..ignore..*/}
					
					if($result)
						$this->insertedData[$order++] = serialize($initData);	
					$allsaved = $allsaved && $result;
				}
			}		
			$tries++;
		} while($tries < $maxTries && !$allsaved);
		if($tries >= $maxTries) {
			echo "\nWARNING: Initial data import may have failed due too many references.\n";
		}
	}
}

