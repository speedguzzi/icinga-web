Ext.ns('Icinga.Cronks.Tackle.Information');

Icinga.Cronks.Tackle.Information.Comments = Ext.extend(Ext.Panel, {
	type : null,
	
	title : _('Comments'),
	iconCls : 'icinga-icon-comment',
	
	dataLoaded : false,
	objectId : null,
	border : false,
	
    constructor : function(config) {
    	
    	if (Ext.isEmpty(config.type)) {
    		throw("config.type is needed: host or service!");
    	}
    	
        Icinga.Cronks.Tackle.Information.Comments.superclass.constructor.call(this, config);
    },
    
    initComponent : function() {
    	
    	this.tbar = [{
    		text : _('Refresh'),
    		iconCls : 'icinga-action-refresh',
    		scope : this,
    		handler : function() {
    			this.store.reload();
    		}
    	}]
    	
        Icinga.Cronks.Tackle.Information.Comments.superclass.initComponent.call(this);
        
        this.on('activate', this.onActivate, this);
        
        this.setLayout(new Ext.layout.FitLayout(Ext.apply({}, this.layoutConfig)));
        
        this.store = new Icinga.Api.RESTStore({
        	autoDestroy : true,
        	idIndex : 0,
        	target : 'comment',
        	columns : [
        	   'INSTANCE_NAME',
        	   'COMMENT_ID',
        	   'COMMENT_DATA',
        	   'COMMENT_AUTHOR_NAME',
        	   'COMMENT_TIME',
        	   'COMMENT_OBJECT_ID',
        	   'COMMENT_TYPE'
        	]
        });
        
        this.expander = new Ext.ux.grid.RowExpander({
            tpl : '<div class="x-icinga-comment-expander-row">{COMMENT_DATA}</div>'
        })
        
        this.grid = new Ext.grid.GridPanel({
        	layout : 'fit',
        	store : this.store,
        	colModel : new Ext.grid.ColumnModel({
        		defaults : {
        			
        		},
        		columns : [this.expander, {
        			header : _('Id'),
        			dataIndex : 'COMMENT_ID'
        		}, {
        			header : _('Entry time'),
        			dataIndex : 'COMMENT_TIME'
        		}, {
        			header : _('Author'),
        			dataIndex : 'COMMENT_AUTHOR_NAME'
        		}, {
        			header : "",
        			dataIndex : "",
        			width: 16,
        			fixed : true,
        			renderer : Icinga.Cronks.Tackle.Renderer.Generic.showIconCls.createDelegate(this, [{
        					iconCls : 'icinga-icon-delete', 
        					qtip : _('Delete comment')
        			}], true),
        			listeners : {
        				click : this.onDeleteComment.createDelegate(this)
        			}
        		}]
        	}),
        	
        	viewConfig: {
        		forceFit : true
        	},
        	
        	plugins : [
        	   this.expander
        	]
        });
        
        this.add(this.grid);
        
        this.doLayout();
    },
    
    onDeleteComment : function(renderer, grid, rowIndex, event) {
    	
    	var data = grid.store.getAt(rowIndex).data;
    	var command = "DEL_" + this.type.toUpperCase() + "_COMMENT";
    	
    	Ext.Msg.show({
    		title : _('Confirmation'),
    		msg : String.format(_('Delete comment {0}?'), data.COMMENT_ID),
    		buttons : Ext.Msg.YESNO,
    		icon: Ext.MessageBox.QUESTION,
    		scope : this,
    		fn : function(buttonId, text, opt) {
    			if (buttonId === 'yes') {
                    Icinga.Api.Command.Facade.sendCommand({
                        command : command,
                        targets : [{instance : data.INSTANCE_NAME}],
                        data : {comment_id : data.COMMENT_ID}
                    });
                    
                    this.store.reload();
    			}
    		}
    		
   	    });
    },
    
    setObjectId : function(oid) {
    	if (oid !== this.objectId) {
    		this.objectId = oid;
    		this.dataLoaded = false;
    		if (this.isVisible() === true) {
    			this.onActivate();
    		}
    	}
    },
    
    getObjectId : function() {
    	return this.objectId;
    },
    
    onActivate : function() {
    	if (this.dataLoaded == false && this.objectId) {
    		this.loadCommentsForObjectId(this.objectId);
    	}
    },
    
    loadCommentsForObjectId : function(oid) {
    	this.store.setFilter({
    		type : 'AND',
    		field : [{
    			type : 'atom',
    			field : ['COMMENT_OBJECT_ID'],
    			method : ['='],
    			value : [oid]
    		}]
    		
    	});
    	
    	this.store.load();
    }
});

Ext.reg('cronks-tackle-information-comments', Icinga.Cronks.Tackle.Information.Comments);