/*global Ext: false, Icinga: false, _: false */
Ext.ns('Icinga.Cronks.Tackle.Filter');

Icinga.Cronks.Tackle.Filter.TackleMainFilterTbar = Ext.extend(Ext.Toolbar, {
    autoRefreshEnabled: true,

    constructor: function(config) {
        "use strict";
        this.parentId = config.id;
        this.store = config.store;
		var filterUpdateTask = new Ext.util.DelayedTask(this.updateFilterImpl, this);
        this.updateFilter = function(t) {
            filterUpdateTask.delay(200,null);
        };
        Ext.Toolbar.prototype.constructor.call(this,{
            items: this.createTbar(config)
        });

    },
    startAutoRefresh: function() {
        if(this.arTask)
            return;
       this.autoRefreshEnabled = false;
       this.arTask = new Ext.util.TaskRunner();
       this.arTask.start({
            run: this.updateFilterImpl,
            interval: AppKit.getPrefVal('org.icinga.grid.refreshTime')*100 || 30000,
            scope:this
        });
    },
    stopAutoRefresh: function() {
        if(!this.arTask)
            return;
        this.autoRefreshEnabled = false;
        this.arTask.stopAll()
        delete(this.arTask);

    },
    updateFilterImpl: function() {
         if(!this.isVisible)
            return;
        var filter = {
            states: {
                0 : Ext.getCmp('filterbuttons_host_state_up_'+this.parentId).pressed,
                1 : Ext.getCmp('filterbuttons_host_state_down_'+this.parentId).pressed,
                2 : Ext.getCmp('filterbuttons_host_state_unreachable_'+this.parentId).pressed,
                99: Ext.getCmp('filterbuttons_host_state_pending_'+this.parentId).pressed
            },
            ack : Ext.getCmp('filterbuttons_host_ack_'+this.parentId).pressed,
            dtime : Ext.getCmp('filterbuttons_host_downtime_'+this.parentId).pressed,
            text : Ext.getCmp('filtertxt_search_'+this.parentId).getValue()
        };
        this.buildFilter(filter);
    },

    buildFilter: function(filter) {
        var jsonFilter = {
            type: 'AND',
            field: []
        };
        for(var i in filter.states) {
            var state = filter.states[i];
            if(state)
                continue;
            jsonFilter.field.push({
                type: 'atom',
                field: ["HOST_CURRENT_STATE"],
                method: ["!="],
                value: [i]
            });
        }
        if(!filter.ack) {
            jsonFilter.field.push({
                type: 'atom',
                field: ["HOST_PROBLEM_HAS_BEEN_ACKNOWLEDGED"],
                method: ["="],
                value: ["0"]
            });
        }
        if(!filter.dtime) {
            jsonFilter.field.push({
                type: 'atom',
                field: ["HOST_SCHEDULED_DOWNTIME_DEPTH"],
                method: ["="],
                value: ["0"]
            });
        }
        if(filter.text) {
           jsonFilter.field.push({
               type: 'OR',
               field: [{
                   type: 'atom',
                   field: ['SERVICE_DISPLAY_NAME'],
                   method: ["LIKE"],
                   value: [filter.text]
               },{
                   type: 'atom',
                   field: ['HOSTGROUP_NAME'],
                   method: ["LIKE"],
                   value: [filter.text]
               },{
                   type: 'atom',
                   field: ['HOST_NAME'],
                   method: ["LIKE"],
                   value: [filter.text]
               }]
           });
        }
        this.store.setFilter(jsonFilter);
        this.ownerCt.bottomToolbar.doLoad();
        if(this.autoRefreshEnabled) {
            this.startAutoRefresh()
        }

    },

    createTbar : function(config) {
        var id = config.id;
        return [{
            xtype: 'button',
            text: _('Refresh'),
            iconCls: 'icinga-icon-arrow-refresh',
            handler: function() {
                this.ownerCt.bottomToolbar.doLoad();
            },
            scope: this
        },{
            xtype: 'button',
            iconCls: 'icinga-icon-application-edit',
            text: 'Options',
            menu: [{
                text: _('Autorefresh'),
                xtype: 'menucheckitem',
                checked: this.autoRefreshEnabled,
                handler: function(state) {
                    this.stopAutoRefresh();
                },
                scope:this
            }]
        },{
            xtype: 'tbspacer',
            width: 20
        },{
            xtype: 'buttongroup',
            defaults: {
                enableToggle: true,
                width:25,
                bubbleEvents: ['toggle']
            },
            events: ['toggle'],

            listeners: {
                toggle: function() {
                    this.updateFilter();
                },
                scope:this
            },

            items: [{
                iconCls: 'icinga-icon-info-problem-acknowledged',
                id: 'filterbuttons_host_ack_'+id,
                tooltip: _('Show acknowledged items')
            },{
                iconCls: 'icinga-icon-info-downtime',
                id: 'filterbuttons_host_downtime_'+id,
                tooltip: _('Show items in downtime')
            }]
        },{
            xtype: 'tbspacer',
            width: 20
        },{
            xtype: 'button',
            iconCls: 'icinga-icon-exclamation-red',
            tooltip: _('Only show open problems'),

            handler: function() {
                var toDisable = ['host_state_up','host_state_pending','host_downtime','host_ack','host_downtime'];
                Ext.iterate(toDisable,function(i) {
                    var el = Ext.getCmp("filterbuttons_"+i+"_"+id);
                    if(!el) {
                        AppKit.log('Tried to disable unknown button '+i+"_"+id);
                        return true;
                    }
                    el.toggle(false);
                    return true;
                });

            }
        },{
            xtype: 'buttongroup',
            id: 'filterbuttons_'+id,
            events:['toggle'],

            listeners: {
                toggle: function() {
                    this.updateFilter();
                },
                scope:this
            },

            defaults: {
                enableToggle: true,
                width:60,
                bubbleEvents: ['toggle']
            },
            items: [{
                toggled: true,
                ctCls: 'tackle_qbtn state_up',
                id: 'filterbuttons_host_state_up_'+id,
                pressed: true,
                text: _('Up')
            },{
                toggled: true,
                ctCls: 'tackle_qbtn state_down',
                id: 'filterbuttons_host_state_down_'+id,
                pressed: true,
                text: _('Down')
            },{
                toggled: true,
                ctCls: 'tackle_qbtn state_unreachable',
                id: 'filterbuttons_host_state_unreachable_'+id,
                pressed: true,
                tooltip: _('Unreachable'),
                text: _('Unreach.')
            },{
                toggled: true,
                ctCls: 'tackle_qbtn state_pending',
                id: 'filterbuttons_host_state_pending_'+id,
                pressed: true,
                text: 'Pending'
            }]
        },{
            xtype: 'textfield',
            emptyText: 'Type to search',
            id: 'filtertxt_search_'+id,
            listeners: {
                focus: function() {
                    Ext.getCmp('filterbuttons_clear_filter_'+id).setDisabled(false);
                },
                change: function(btn,v) {
                    if(v !== "")
                        Ext.getCmp('filterbuttons_clear_filter_'+id).setDisabled(false);
                    else
                        Ext.getCmp('filterbuttons_clear_filter_'+id).setDisabled(true);
                    this.updateFilter();
                },
                scope:this
            }
        }, {
            xtype: 'button',
            iconCls: 'icinga-icon-cancel',
            id: 'filterbuttons_clear_filter_'+id,
            handler: function(btn) {
                Ext.getCmp('filtertxt_search_'+id).reset();
                btn.setDisabled(true);
            },

            style: 'position:relative;margin-left:-25px',
            disabled:true
        }];
    }
});