AppKit.util = (function() {
	var pub = {};
	var pstores = new Ext.util.MixedCollection(true);
	
	return Ext.apply(pub, {
		contentWindow : function(uconf, wconf) {
	
			Ext.applyIf(wconf, {
				bodyStyle: 'padding: 30px 30px',
				bodyCssClass: 'static-content-container'
			});
	
			Ext.apply(wconf, {
				renderTo: Ext.getBody(),
				footer: true,
				closable: false,
				
				buttons: [{
					text: _('Close'),
					handler: function() {
						win.close();
					}
				}],
				
				autoLoad: uconf
			});
			
			var win = new Ext.Window(wconf);
			
			win.setSize(Math.round(Ext.lib.Dom.getViewWidth() * 60 / 100), Math.round(Ext.lib.Dom.getViewHeight() * 80 / 100));
			win.center();
			
			win.show();
		},
		
		getStore : function(store_name) {
			if (pstores.containsKey(store_name)) {
				var s = pstores.get(store_name);
				if (s instanceof Ext.util.MixedCollection) {
					return s;
				}
				else {
					throw("Store" + store_name + " was gone away, not a store class anymore!");
				}
			}		
			else {
				return pstores.add(store_name, (new Ext.util.MixedCollection));
			}
		},
		
		/**
		 * Handling logout the agavi way
		 * @param string target
		 */
		doLogout : function(target) {
			Ext.Msg.show({
				title: _('To be on the verge to logout ...'),
				msg: _('Are you sure to to this?'),
				buttons: Ext.MessageBox.YESNO,
				icon: Ext.MessageBox.QUESTION,
				fn: function(b) {
					if (b=="yes") {
						AppKit.changeLocation(target);
					}
				}
			});
		},
		
		/**
		 * Handling the preferences editor
		 * within a window
		 * @param string target
		 */
		doPreferences : function(target) {
			if (!Ext.getCmp('user_prefs_target')) {
				var pwin = new Ext.Window({
					title: _('User preferences'),
					closable: true,
					resizable: true,
					id: 'user_prefs_target',
					width: 450,
					height: 530,
					autoScroll: true,
					closeAction: 'hide',
					
					bbar: {
						items: [{
							text: _('Close and refresh'),
							iconCls: 'silk-accept',
							handler: function() {
								AppKit.changeLocation(AppKit.c.path);
							}
						}, {
							text: _('Only close'),
							iconCls: 'silk-cancel',
							handler: function() {
								pwin.close();
							}
						}]
					},
					
					autoLoad: {
						url: target,
						scripts: true
					}
				});
			}
			
			Ext.getCmp('user_prefs_target').show();
		}
		
	});
})();
	
	