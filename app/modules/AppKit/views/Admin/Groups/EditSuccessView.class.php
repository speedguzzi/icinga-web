<?php

class AppKit_Admin_Groups_EditSuccessView extends AppKitBaseView
{
	public function executeSimplecontent(AgaviRequestDataHolder $rd) {
		if($this->getContext()->getRequest()->getMethod() == "write")
			return null;
		$this->executeHtml($rd);
	}
	public function executeHtml(AgaviRequestDataHolder $rd)
	{
		$this->setupHtml($rd);
		try {
			$useradmin = $this->getContext()->getModel("UserAdmin","AppKit");
			$users = $useradmin->getUsersCollection();
					
			$this->setAttributeByRef("users",$users);
			$this->setAttribute("container",$rd->getParameter("container"));
	
			$exec = $this->getContext()->getController()->createExecutionContainer("AppKit","Admin.PrincipalEditor",null,'simplecontent');
			$resp = $exec->execute()->getContent();
			$this->setAttribute("principal_editor",$resp);
		}
		catch (AppKitDoctrineException $e) {
			$this->getMessageQueue()->enqueue(AppKitMessageQueueItem::Error($e->getMessage()));
			$this->setAttribute('title', 'An error occured');
		}
	}
}

?>