/**
 * Returns an object that describes the role edit form for the admin panel
 * 
 * @param Object    The configuration object of the RoleManager
 * @return Object   The editor form component
 *
 **/
AppKit.Admin.RoleEditForm = function(cfg) {

    /**
    * Definine private (static) datasources for each component
    *
    **/
    
    var roleStore = new Ext.data.JsonStore({
        root: 'role',
        idProperty: 'id',
        url: 'none',
        fields: [
            'id',
            'name',
            'description',
            {
                name: 'disabled',
                type:'boolean',
                mapping: 'active',
                convert: function(v) {
                    return !v;
                }
            },
            'modified',
            'created',
            'users',
            'principals'
        ],
        newRole: function() {
            Ext.iterate(this.fields.keys,function(key) {
                var field = Ext.getCmp("form_role_"+key);
                if(!field)
                    return;
                field.setValue("");
            },this);
            Ext.getCmp("form_role_id").setValue('new');
            roleUserStore.removeAll()
            credentialView.selectValues([]);
            hostgroupPrincipalsView.selectValues([]);
            servicegroupPrincipalsView.selectValues([]);
            customVariableView.selectValues([]);
            roleRestrictionFlagsView.selectValues([]);
        },
        listeners:{
            load: function(store,records, options) {
                var record = records[0];
                if(!record)
                    return;

                Ext.iterate(record.fields.keys,function(key) {
                    var field = Ext.getCmp("form_role_"+key);
                    if(!field)
                        return;
                    field.setValue(record.get(key));
                },this);
                roleUserStore.loadData(record.get('users'));
                usersView.getBottomToolbar().doRefresh();
               
                var principals = record.get('principals');
                credentialView.selectValues(principals);
                hostgroupPrincipalsView.selectValues(principals);
                servicegroupPrincipalsView.selectValues(principals);
                customVariableView.selectValues(principals);
                roleRestrictionFlagsView.selectValues(principals);
            },
            scope:this
        }
       
    });
    
    var roleUserStore = new Ext.data.JsonStore({
        idProperty: 'id',
        fields: ['name','firstname','lastname','active','id'],
        proxy: new Ext.data.PagingMemoryProxy(),
        loadData: function(data) {
            this.proxy.data = data;
           // return Ext.data.JsonStore.prototype.loadData.apply(this,arguments);
        }
    });
 
    var roleCredentialStore = new Ext.data.JsonStore({
        idProperty: 'target_id',
        fields: ['target_id','target_name','target_description'],
        data: cfg.availablePrincipals
    });
 
    var roleHostgroupPrincipalStore = new Ext.data.JsonStore({
        idProperty: 'hostgroup',
        fields: ['hostgroup']
    });
    var roleServicegroupPrincipalStore = new Ext.data.JsonStore({
        idProperty: 'servicegroup',
        fields: ['servicegroup']
    });
    
    var roleCustomvarPrincipalStore = new Ext.data.JsonStore({
        fields: ['id','name','value','target']
    });
    
    /** 
     *  Initialize the single component views
     */
    
    var hostgroupPrincipalsView = new AppKit.Admin.Components.GroupRestrictionView({
        store: roleHostgroupPrincipalStore,
        type: 'role',
        target: 'hostgroup'
    })
    
    var servicegroupPrincipalsView = new AppKit.Admin.Components.GroupRestrictionView({
        store: roleServicegroupPrincipalStore,
        type: 'role',
        target: 'servicegroup'
    })
    var usersView = new AppKit.Admin.Components.UserSelectionGrid({
        store: roleUserStore,
        userProviderURI: cfg.userProviderURI
    });
    var customVariableView = new AppKit.Admin.Components.CVGridPanel({
        store: roleCustomvarPrincipalStore
    });
    
    var credentialView = new AppKit.Admin.Components.CredentialGrid({
        store: roleCredentialStore,
        type: 'role'
    });
    

    var roleRestrictionFlagsView = new AppKit.Admin.Components.RestrictionFlagsView({
        type: 'role'
    });
    
    /**
     * Binds a role with id to the edit form
     * @param Integer|String The id of the role or 'new' if a new role should be created
     * @param String  The url that provides role lookup 
     */
    AppKit.Admin.RoleEditForm.bindRole = function(id,url) {
        if(id != 'new') {
            roleStore.proxy.setUrl(url+"/id="+id);
            roleStore.load();
        } else {
            roleStore.newRole();
        }
    }
    
    /**
     * Saves the current bound role (or new role)
     * @param String    The URI where to store the user
     * @param Function  Callback function that will be called on success
     * @param Function  Callback function that will be called on failure
     */
    AppKit.Admin.RoleEditForm.saveRole = function(url,success,fail) {
        roleStore.proxy.setUrl(url+"/create?dc="+parseInt(Math.random()*10000,10));
        var params = {}
        
        var i=0;
        roleUserStore.each(function(user) {
            params["role_users["+(i++)+"]"] = user.get("id");
        });
        var i=0;
        roleHostgroupPrincipalStore.each(function(p) {
            params["principal_target["+i+"][name][]"] = "IcingaHostgroup";
            params["principal_value["+i+"][hostgroup][]"] = p.get("hostgroup"); 
            params["principal_target["+i+"][set][]"] = 1;
            i++;
        });
        roleServicegroupPrincipalStore.each(function(p) {
            params["principal_target["+i+"][name][]"] = "IcingaServicegroup";
            params["principal_value["+i+"][serviegroup][]"] = p.get("servicegroup"); 
            params["principal_target["+i+"][set][]"] = 1;
            i++;
        });
        roleCustomvarPrincipalStore.each(function(p) {
            if(p.get("target") == "host")
                params["principal_target["+i+"][name][]"] = "IcingaHostCustomVariablePair";
            else if(p.get("target") == "service")
                params["principal_target["+i+"][name][]"] = "IcingaServiceCustomVariablePair";
            else 
                return;
            params["principal_target["+i+"][set][]"] = 1;
            params["principal_value["+i+"][cv_name][]"] = p.get("name");
            params["principal_value["+i+"][cv_value][]"] = p.get("value");
            i++;
        });
        
        Ext.iterate(roleCredentialStore.selectedValues,function(p) {
            params["principal_target["+i+"][set][]"] = 1;
            params["principal_target["+i+"][name][]"] = p.get("target_name");
            i++;
        });
        Ext.iterate(roleRestrictionFlagsView.roleFlags,function(flag) {
            if(!Ext.getCmp(flag.id).getValue())
                return true;
            params["principal_target["+i+"][set][]"] = 1;
            params["principal_target["+i+"][name][]"] = flag.principal;
            i++;
        });
        
        var paramMap = {
            id: 'form_role_id',
            role_name: 'form_role_name',
            role_description: 'form_role_description',
            role_disabled: 'form_role_disabled'
        }
        for(var id in paramMap) {
            var cmp = Ext.getCmp(paramMap[id]);
            if(cmp.isValid()) 
                if(cmp.getValue()) // don't write empty fields 
                    params[id] = cmp.getValue()
                else continue;
            else return fail(arguments);
        }
        roleStore.on("load",function() {
            success(arguments);
        },this,{single:true});
        roleStore.on("exception",function() {
            fail(arguments);
        },this,{single:true});
        if(params.role_disabled)
            params.role_disabled = 1;
        roleStore.load({params: params});
    }
    
    /**
     * Return form definition
     */
    return [
        {
            xtype: 'hidden',
            name: 'role_id',
            id: 'form_role_id'
        },{
            xtype:'fieldset',
            title: _('General information'),
            defaults: {
                allowBlank: false
            },
            items: [{
                xtype:'textfield',
                fieldLabel: _('Group name'),
                name: 'role_name',
                id: 'form_role_name',
                anchor: '95%',
                minLength: 3,
                maxLength: 18
            },{
                xtype:'textfield',
                fieldLabel: _('Description'),	
                name: 'role_description',
                id: 'form_role_description',
                anchor: '95%'

            }, {
                xtype: 'checkbox',
                name: 'role_disabled',
                id: 'form_role_disabled',
                fieldLabel: _('Disabled')
            }]
        },{
            xtype:'spacer',
            height:25
        },{
            xtype: 'fieldset',
            title: _('Meta information'),
            items: [{
                xtype:'displayfield',
                fieldLabel: _('Created'),
                name: 'role_created',
                id: 'form_role_created',
                preventMark: true,
                allowBlank: true,
                anchor: '95%'				
            },{
                xtype:'displayfield',
                fieldLabel: _('Modified'),
                name: 'role_modified',
                id: 'form_role_modified',
                preventMark: true,
                allowBlank: true,
                anchor: '95%'
            }]
        },{
            xtype: 'tabpanel',
            activeTab: 0,
            height:300,
            enableTabScroll: true,
            items: [
                credentialView,
                usersView,
                hostgroupPrincipalsView,
                servicegroupPrincipalsView,
                customVariableView, 
                roleRestrictionFlagsView

            ],
            listeners: {
                tabchange: function(_this,panel) {
                    if(panel.updateView)
                        panel.updateView();
                }  
            },
            minHeight:200,
            autScroll:true,
            height:400
        }
    ]

}