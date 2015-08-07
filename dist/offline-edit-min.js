/*! offline-editor-js - v2.12.0 - 2015-08-07
*   Copyright (c) 2015 Environmental Systems Research Institute, Inc.
*   Apache License*/
define(["dojo/Evented","dojo/_base/Deferred","dojo/promise/all","dojo/_base/declare","dojo/_base/array","dojo/dom-attr","dojo/dom-style","dojo/query","esri/config","esri/kernel","esri/layers/GraphicsLayer","esri/graphic","esri/request","esri/symbols/SimpleMarkerSymbol","esri/symbols/SimpleLineSymbol","esri/symbols/SimpleFillSymbol","esri/urlUtils"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q){"use strict";return d("O.esri.Edit.OfflineFeaturesManager",[a],{_onlineStatus:"online",_featureLayers:{},_featureCollectionUsageFlag:!1,_editStore:new O.esri.Edit.EditStore,_defaultXhrTimeout:15e3,ONLINE:"online",OFFLINE:"offline",RECONNECTING:"reconnecting",attachmentsStore:null,proxyPath:null,ENABLE_FEATURECOLLECTION:!1,DB_NAME:"features_store",DB_OBJECTSTORE_NAME:"features",DB_UID:"objectid",ATTACHMENTS_DB_NAME:"attachments_store",ATTACHMENTS_DB_OBJECTSTORE_NAME:"attachments",events:{EDITS_SENT:"edits-sent",EDITS_ENQUEUED:"edits-enqueued",EDITS_ENQUEUED_ERROR:"edits-enqueued-error",EDITS_SENT_ERROR:"edits-sent-error",ALL_EDITS_SENT:"all-edits-sent",ATTACHMENT_ENQUEUED:"attachment-enqueued",ATTACHMENTS_SENT:"attachments-sent",EXTEND_COMPLETE:"extend-complete"},initAttachments:function(a){if(a=a||function(a){},!this._checkFileAPIs())return a(!1,"File APIs not supported");try{if(this.attachmentsStore=new O.esri.Edit.AttachmentsStore,this.attachmentsStore.dbName=this.ATTACHMENTS_DB_NAME,this.attachmentsStore.objectStoreName=this.ATTACHMENTS_DB_OBJECTSTORE_NAME,!this.attachmentsStore.isSupported())return a(!1,"indexedDB not supported");this.attachmentsStore.init(a)}catch(b){}},extend:function(a,d,i){function j(){try{a._phantomLayer=new k({opacity:.8}),a._map.addLayer(a._phantomLayer)}catch(b){}}var m=[],n=this;a.offlineExtended=!0,a.objectIdField=this.DB_UID;var o=null;a.url&&(o=a.url,this._featureLayers[a.url]=a),a._mode.featureLayer.hasOwnProperty("_collection")&&(this._featureCollectionUsageFlag=!0),this._editStore._isDBInit||m.push(this._initializeDB(i,o)),a._applyEdits=a.applyEdits,a._addAttachment=a.addAttachment,a._queryAttachmentInfos=a.queryAttachmentInfos,a._deleteAttachments=a.deleteAttachments,a._updateAttachment=a.updateAttachment,a.queryAttachmentInfos=function(a,c,d){if(n.getOnlineStatus()===n.ONLINE){var e=this._queryAttachmentInfos(a,function(){n.emit(n.events.ATTACHMENTS_INFO,arguments),c&&c.apply(this,arguments)},d);return e}if(n.attachmentsStore){var f=new b;return n.attachmentsStore.getAttachmentsByFeatureId(this.url,a,function(a){c&&c(a),f.resolve(a)}),f}},a.addAttachment=function(a,c,d,e){if(n.getOnlineStatus()===n.ONLINE)return this._addAttachment(a,c,function(){n.emit(n.events.ATTACHMENTS_SENT,arguments),d&&d.apply(this,arguments)},function(a){e&&e.apply(this,arguments)});if(n.attachmentsStore){var f=this._getFilesFromForm(c),g=f[0],i=new b,j=this._getNextTempId();return n.attachmentsStore.store(this.url,j,a,g,n.attachmentsStore.TYPE.ADD,function(b,c){var f={attachmentId:j,objectId:a,success:b};if(b){n.emit(n.events.ATTACHMENT_ENQUEUED,f),d&&d(f),i.resolve(f);var g=this._url.path+"/"+a+"/attachments/"+j,k=h("[href="+g+"]");k.attr("href",c.url)}else f.error="can't store attachment",e&&e(f),i.reject(f)}.bind(this)),i}},a.updateAttachment=function(a,c,d,e,f){if(n.getOnlineStatus()===n.ONLINE)return this._updateAttachment(a,c,d,function(){e&&e.apply(this,arguments)},function(a){f&&f.apply(this,arguments)});if(n.attachmentsStore){var g=this._getFilesFromForm(d),i=g[0],j=n.attachmentsStore.TYPE.UPDATE,k=new b;return 0>c&&(j=n.attachmentsStore.TYPE.ADD),n.attachmentsStore.store(this.url,c,a,i,j,function(b,d){var g={attachmentId:c,objectId:a,success:b};if(b){n.emit(n.events.ATTACHMENT_ENQUEUED,g),e&&e(g),k.resolve(g);var i=this._url.path+"/"+a+"/attachments/"+c,j=h("[href="+i+"]");j.attr("href",d.url)}else g.error="layer.updateAttachment::attachmentStore can't store attachment",f&&f(g),k.reject(g)}.bind(this)),k}},a.deleteAttachments=function(a,d,e,f){if(n.getOnlineStatus()===n.ONLINE){var g=this._deleteAttachments(a,d,function(){e&&e.apply(this,arguments)},function(a){f&&f.apply(this,arguments)});return g}if(n.attachmentsStore){var h=[];d.forEach(function(c){c=parseInt(c,10);var d=new b;if(0>c)n.attachmentsStore["delete"](c,function(b){var e={objectId:a,attachmentId:c,success:b};d.resolve(e)});else{var e=new Blob([],{type:"image/png"});n.attachmentsStore.store(this.url,c,a,e,n.attachmentsStore.TYPE.DELETE,function(b,e){var f={attachmentId:c,objectId:a,success:b};b?d.resolve(f):d.reject(f)}.bind(this))}h.push(d)},this);var i=c(h);return i.then(function(a){e&&e(a)}),i}},a.applyEdits=function(d,e,f,g,h){var i=[];if(n.getOnlineStatus()===n.ONLINE){var j=this._applyEdits(d,e,f,function(){n.emit(n.events.EDITS_SENT,arguments),g&&g.apply(this,arguments)},h);return j}var k=new b,l={addResults:[],updateResults:[],deleteResults:[]},m={};return d=d||[],d.forEach(function(a){var c=new b,d=this._getNextTempId();a.attributes[this.objectIdField]=d;var e=this;this._validateFeature(a,this.url,n._editStore.ADD).then(function(b){b.success?e._pushValidatedAddFeatureToDB(e,a,b.operation,l,d,c):c.resolve(!0)},function(a){c.reject(a)}),i.push(c)},this),e=e||[],e.forEach(function(a){var c=new b,d=a.attributes[this.objectIdField];m[d]=a;var e=this;this._validateFeature(a,this.url,n._editStore.UPDATE).then(function(b){b.success?e._pushValidatedUpdateFeatureToDB(e,a,b.operation,l,d,c):c.resolve(!0)},function(a){c.reject(a)}),i.push(c)},this),f=f||[],f.forEach(function(a){var c=new b,d=a.attributes[this.objectIdField],e=this;this._validateFeature(a,this.url,n._editStore.DELETE).then(function(b){b.success?e._pushValidatedDeleteFeatureToDB(e,a,b.operation,l,d,c):c.resolve(!0)},function(a){c.reject(a)}),i.push(c)},this),c(i).then(function(b){for(var c=!0,e=0;e<b.length;e++)b[e]===!1&&(c=!1);a._pushFeatureCollections(),this._editHandler(l,d,m,g,h,k),c===!0?n.emit(n.events.EDITS_ENQUEUED,l):n.emit(n.events.EDITS_ENQUEUED_ERROR,l)}.bind(this)),k},a.convertGraphicLayerToJSON=function(a,b,c){var d={};b.target.hasOwnProperty("objectIdField")?d.objectIdFieldName=b.target.objectIdField:d.objectIdFieldName=this.objectIdField,d.globalIdFieldName=b.target.globalIdField,d.geometryType=b.target.geometryType,d.spatialReference=b.target.spatialReference,d.fields=b.target.fields;for(var e=a.length,f=[],g=0;e>g;g++){var h=a[g].toJson();if(f.push(h),g==e-1){var i=JSON.stringify(f),j=JSON.stringify(d);c(i,j);break}}},a.getFeatureLayerJSON=function(a,b){require(["esri/request"],function(c){var d=c({url:a,content:{f:"json"},handleAs:"json",callbackParamName:"callback"});d.then(function(a){b(!0,a)},function(a){b(!1,a.message)})})},a.setFeatureLayerJSONDataStore=function(a,b){n._editStore.pushFeatureLayerJSON(a,function(a,c){b(a,c)})},a.getFeatureLayerJSONDataStore=function(a){n._editStore.getFeatureLayerJSON(function(b,c){a(b,c)})},a.setPhantomLayerGraphics=function(a){var b=a.length;if(b>0)for(var c=0;b>c;c++){var d=new l(a[c]);this._phantomLayer.add(d)}},a.getPhantomLayerGraphics=function(b){for(var c=a._phantomLayer.graphics,d=a._phantomLayer.graphics.length,e=[],f=0;d>f;f++){var g=c[f].toJson();if(e.push(g),f==d-1){var h=JSON.stringify(e);b(h);break}}},a.getPhantomGraphicsArray=function(a){n._editStore.getPhantomGraphicsArray(function(b,c){"end"==c?a(!0,b):a(!1,c)})},a.getAttachmentsUsage=function(a){n.attachmentsStore.getUsage(function(b,c){a(b,c)})},a.resetAttachmentsDatabase=function(a){n.attachmentsStore.resetAttachmentsQueue(function(b,c){a(b,c)})},a.getUsage=function(a){n._editStore.getUsage(function(b,c){a(b,c)})},a.resetDatabase=function(a){n._editStore.resetEditsQueue(function(b,c){a(b,c)})},a.pendingEditsCount=function(a){n._editStore.pendingEditsCount(function(b){a(b)})},a.getFeatureDefinition=function(a,b,c,d){var e={layerDefinition:a,featureSet:{features:b,geometryType:c}};d(e)},a.getAllEditsArray=function(a){n._editStore.getAllEditsArray(function(b,c){"end"==c?a(!0,b):a(!1,c)})},a._pushFeatureCollections=function(){n._editStore._getFeatureCollections(function(b,c){var d={featureLayerUrl:a.url,featureLayerCollection:a.toJson()},e=[d],f={id:n._editStore.FEATURE_COLLECTION_ID,featureCollections:e};if(a.hasAttachments=d.featureLayerCollection.layerDefinition.hasAttachments,b){for(var g=0,h=0;h<c.featureCollections.length;h++)c.featureCollections[h].featureLayerUrl===a.url&&(g++,c.featureCollections[h]=d);0===g&&c.featureCollections.push(d)}else b||null!==c||(c=f);n._editStore._pushFeatureCollections(c,function(a,b){})})},a._pushValidatedDeleteFeatureToDB=function(a,b,c,d,e,h){n._editStore.pushEdit(c,a.url,b,function(c,i){if(c){d.deleteResults.push({success:!0,error:null,objectId:e});var j={};j[n.DB_UID]=e;var k=new l(b.geometry,n._getPhantomSymbol(b.geometry,n._editStore.DELETE),j);a._phantomLayer.add(k),n._editStore.pushPhantomGraphic(k,function(a){}),f.set(k.getNode(),"stroke-dasharray","4,4"),g.set(k.getNode(),"pointer-events","none"),n.attachmentsStore&&n.attachmentsStore.deleteAttachmentsByFeatureId(a.url,e,function(a){})}else d.deleteResults.push({success:!1,error:i,objectId:e});h.resolve(c)})},a._pushValidatedUpdateFeatureToDB=function(a,b,c,d,e,h){n._editStore.pushEdit(c,a.url,b,function(c,i){if(c){d.updateResults.push({success:!0,error:null,objectId:e});var j={};j[n.DB_UID]=e;var k=new l(b.geometry,n._getPhantomSymbol(b.geometry,n._editStore.UPDATE),j);a._phantomLayer.add(k),n._editStore.pushPhantomGraphic(k,function(a){}),f.set(k.getNode(),"stroke-dasharray","5,2"),g.set(k.getNode(),"pointer-events","none")}else d.updateResults.push({success:!1,error:i,objectId:e});h.resolve(c)})},a._pushValidatedAddFeatureToDB=function(a,b,c,d,e,h){n._editStore.pushEdit(c,a.url,b,function(c,i){if(c){d.addResults.push({success:!0,error:null,objectId:e});var j={};j[n.DB_UID]=e;var k=new l(b.geometry,n._getPhantomSymbol(b.geometry,n._editStore.ADD),j);a._phantomLayer.add(k),n._editStore.pushPhantomGraphic(k,function(a){}),f.set(k.getNode(),"stroke-dasharray","10,4"),g.set(k.getNode(),"pointer-events","none")}else d.addResults.push({success:!1,error:i,objectId:e});h.resolve(c)})},a._validateFeature=function(c,d,e){var f=new b,g=d+"/"+c.attributes[n.DB_UID];return n._editStore.getEdit(g,function(b,d){if(b)switch(e){case n._editStore.ADD:f.resolve({success:!0,graphic:c,operation:e});break;case n._editStore.UPDATE:d.operation==n._editStore.ADD&&(c.operation=n._editStore.ADD,e=n._editStore.ADD),f.resolve({success:!0,graphic:c,operation:e});break;case n._editStore.DELETE:var g=!0;d.operation==n._editStore.ADD&&a._deleteTemporaryFeature(c,function(a){a||(g=!1)}),f.resolve({success:g,graphic:c,operation:e})}else"Id not found"==d?f.resolve({success:!0,graphic:c,operation:e}):f.reject(c)}),f},a._deleteTemporaryFeature=function(d,e){function f(){var c=new b;return n._editStore["delete"](a.url,d,function(a,b){a?c.resolve(!0):c.resolve(!1)}),c.promise}function g(){var a=new b;return n._editStore.deletePhantomGraphic(h,function(b){b?a.resolve(!0):a.resolve(!1)},function(b){a.resolve(!1)}),a.promise}var h=n._editStore.PHANTOM_GRAPHIC_PREFIX+n._editStore._PHANTOM_PREFIX_TOKEN+d.attributes[n.DB_UID];c([f(),g()]).then(function(a){e(a)})},a._getFilesFromForm=function(a){var b=[],c=e.filter(a.elements,function(a){return"file"===a.type});return c.forEach(function(a){b.push.apply(b,a.files)},this),b},a._replaceFeatureIds=function(a,b,c){a.length||c(0);var d,e=a.length,f=e,g=0;for(d=0;e>d;d++)n.attachmentsStore.replaceFeatureId(this.url,a[d],b[d],function(a){--f,g+=a?1:0,0===f&&c(g)}.bind(this))},a._nextTempId=-1,a._getNextTempId=function(){return this._nextTempId--},j(),c(m).then(function(b){0===b.length&&o?(this.ENABLE_FEATURECOLLECTION&&a._pushFeatureCollections(),d(!0,null)):b[0].success&&!o?this._editStore.getFeatureLayerJSON(function(b,c){b?(this._featureLayers[c.__featureLayerURL]=a,a.url=c.__featureLayerURL,this.ENABLE_FEATURECOLLECTION&&a._pushFeatureCollections(),d(!0,null)):d(!1,c)}.bind(this)):b[0].success&&(this.ENABLE_FEATURECOLLECTION&&a._pushFeatureCollections(),d(!0,null))}.bind(this))},goOffline:function(){this._onlineStatus=this.OFFLINE},goOnline:function(a){this._onlineStatus=this.RECONNECTING,this._replayStoredEdits(function(b,c){var d={success:b,responses:c};this._onlineStatus=this.ONLINE,null!=this.attachmentsStore?this._sendStoredAttachments(function(b,c,e){d.attachments={success:b,responses:c,dbResponses:e},a&&a(d)}.bind(this)):a&&a(d)}.bind(this))},getOnlineStatus:function(){return this._onlineStatus},serializeFeatureGraphicsArray:function(a,b){for(var c=a.length,d=[],e=0;c>e;e++){var f=a[e].toJson();if(d.push(f),e==c-1){var g=JSON.stringify(d);b(g);break}}},getFeatureCollections:function(a){this._editStore._isDBInit?this._editStore._getFeatureCollections(function(b,c){a(b,c)}):this._initializeDB(null,null).then(function(b){b.success&&this._editStore._getFeatureCollections(function(b,c){a(b,c)})}.bind(this),function(b){a(!1,b)})},getFeatureLayerJSONDataStore:function(a){this._editStore._isDBInit?this._editStore.getFeatureLayerJSON(function(b,c){a(b,c)}):this._initializeDB(null,null).then(function(b){b.success&&this._editStore.getFeatureLayerJSON(function(b,c){a(b,c)})}.bind(this),function(b){a(!1,b)})},_initializeDB:function(a,c){var d=new b,e=this._editStore;return e.dbName=this.DB_NAME,e.objectStoreName=this.DB_OBJECTSTORE_NAME,e.objectId=this.DB_UID,e.init(function(b,f){"object"==typeof a&&b===!0&&void 0!==a&&null!==a?(c&&(a.__featureLayerURL=c),e.pushFeatureLayerJSON(a,function(a,b){a?d.resolve({success:!0,error:null}):d.reject({success:!1,error:b})})):b?d.resolve({success:!0,error:null}):d.reject({success:!1,error:null})}),d},_checkFileAPIs:function(){return window.File&&window.FileReader&&window.FileList&&window.Blob?(XMLHttpRequest.prototype.sendAsBinary||(XMLHttpRequest.prototype.sendAsBinary=function(a){function b(a){return 255&a.charCodeAt(0)}var c=Array.prototype.map.call(a,b),d=new Uint8Array(c);this.send(d.buffer)}),!0):!1},_extendAjaxReq:function(a){a.sendAsBinary=XMLHttpRequest.prototype.sendAsBinary},_phantomSymbols:[],_getPhantomSymbol:function(a,b){if(0===this._phantomSymbols.length){var c=[0,255,0,255],d=1.5;this._phantomSymbols.point=[],this._phantomSymbols.point[this._editStore.ADD]=new n({type:"esriSMS",style:"esriSMSCross",xoffset:10,yoffset:10,color:[255,255,255,0],size:15,outline:{color:c,width:d,type:"esriSLS",style:"esriSLSSolid"}}),this._phantomSymbols.point[this._editStore.UPDATE]=new n({type:"esriSMS",style:"esriSMSCircle",xoffset:0,yoffset:0,color:[255,255,255,0],size:15,outline:{color:c,width:d,type:"esriSLS",style:"esriSLSSolid"}}),this._phantomSymbols.point[this._editStore.DELETE]=new n({type:"esriSMS",style:"esriSMSX",xoffset:0,yoffset:0,color:[255,255,255,0],size:15,outline:{color:c,width:d,type:"esriSLS",style:"esriSLSSolid"}}),this._phantomSymbols.multipoint=null,this._phantomSymbols.polyline=[],this._phantomSymbols.polyline[this._editStore.ADD]=new o({type:"esriSLS",style:"esriSLSSolid",color:c,width:d}),this._phantomSymbols.polyline[this._editStore.UPDATE]=new o({type:"esriSLS",style:"esriSLSSolid",color:c,width:d}),this._phantomSymbols.polyline[this._editStore.DELETE]=new o({type:"esriSLS",style:"esriSLSSolid",color:c,width:d}),this._phantomSymbols.polygon=[],this._phantomSymbols.polygon[this._editStore.ADD]=new p({type:"esriSFS",style:"esriSFSSolid",color:[255,255,255,0],outline:{type:"esriSLS",style:"esriSLSSolid",color:c,width:d}}),this._phantomSymbols.polygon[this._editStore.UPDATE]=new p({type:"esriSFS",style:"esriSFSSolid",color:[255,255,255,0],outline:{type:"esriSLS",style:"esriSLSDash",color:c,width:d}}),this._phantomSymbols.polygon[this._editStore.DELETE]=new p({type:"esriSFS",style:"esriSFSSolid",color:[255,255,255,0],outline:{type:"esriSLS",style:"esriSLSDot",color:c,width:d}})}return this._phantomSymbols[a.type][b]},_uploadAttachment:function(a){var c=new b,d=this._featureLayers[a.featureLayerUrl],e=new FormData;switch(e.append("attachment",a.file),a.type){case this.attachmentsStore.TYPE.ADD:d.addAttachment(a.objectId,e,function(b){c.resolve({attachmentResult:b,id:a.id})},function(a){c.reject(a)});break;case this.attachmentsStore.TYPE.UPDATE:e.append("attachmentId",a.id),d._sendAttachment("update",a.objectId,e,function(b){c.resolve({attachmentResult:b,id:a.id})},function(a){c.reject(a)});break;case this.attachmentsStore.TYPE.DELETE:d.deleteAttachments(a.objectId,[a.id],function(b){c.resolve({attachmentResult:b,id:a.id})},function(a){c.reject(a)})}return c.promise},_deleteAttachmentFromDB:function(a,c){var d=new b;return this.attachmentsStore["delete"](a,function(a){d.resolve({success:a,result:c})}),d},_cleanAttachmentsDB:function(a,b){var d=this,e=[],f=0;a.forEach(function(a){"object"==typeof a.attachmentResult&&a.attachmentResult.success?e.push(d._deleteAttachmentFromDB(a.id,null)):a.attachmentResult instanceof Array?a.attachmentResult.forEach(function(b){b.success?e.push(d._deleteAttachmentFromDB(a.id,null)):f++}):f++});var g=c(e);g.then(function(c){b(f>0?{errors:!0,attachmentsDBResults:c,uploadResults:a}:{errors:!1,attachmentsDBResults:c,uploadResults:a})})},_sendStoredAttachments:function(a){this.attachmentsStore.getAllAttachments(function(b){var d=this,e=[];b.forEach(function(a){var b=this._uploadAttachment(a);e.push(b)},this);var f=c(e);f.then(function(b){d._cleanAttachmentsDB(b,function(c){c.errors?a&&a(!1,b,c):a&&a(!0,b,c)})},function(b){a&&a(!1,b)})}.bind(this))},_replayStoredEdits:function(a){var b,d={},e=this,f=[],g=[],h=[],i=[],j=[],k=this._featureLayers,m=this.attachmentsStore,n=this._editStore;this._editStore.getAllEditsArray(function(o,p){if(o.length>0){j=o;for(var q=j.length,r=0;q>r;r++){b=k[j[r].layer],null==m&&b.hasAttachments,b._attachmentsStore=m,b.__onEditsComplete=b.onEditsComplete,b.onEditsComplete=function(){},f=[],g=[],h=[],i=[];var s=new l(j[r].graphic);switch(j[r].operation){case n.ADD:for(var t=0;t<b.graphics.length;t++){var u=b.graphics[t];if(u.attributes[b.objectIdField]===s.attributes[b.objectIdField]){b.remove(u);break}}i.push(s.attributes[b.objectIdField]),delete s.attributes[b.objectIdField],f.push(s);break;case n.UPDATE:g.push(s);break;case n.DELETE:h.push(s)}d[r]=e._internalApplyEditsAll(b,j[r].id,i,f,g,h)}var v=c(d);v.then(function(b){this._parseResponsesArray(b).then(function(c){c?this.emit(this.events.ALL_EDITS_SENT,b):this.emit(this.events.EDITS_SENT_ERROR,{msg:"Not all edits synced",respones:b}),a&&a(!0,b)}.bind(this))}.bind(e),function(b){a&&a(!1,b)}.bind(e))}else a(!0,[])})},_cleanSuccessfulEditsDatabaseRecords:function(a,b){if(0!==Object.keys(a).length){var d=[],e=[];for(var f in a)if(a.hasOwnProperty(f)){var g=a[f],h={};g.updateResults.length>0&&(g.updateResults[0].success?(h.layer=g.layer,h.id=g.updateResults[0].objectId,d.push(h)):e.push(g)),g.deleteResults.length>0&&(g.deleteResults[0].success?(h.layer=g.layer,h.id=g.deleteResults[0].objectId,d.push(h)):e.push(g)),g.addResults.length>0&&(g.addResults[0].success?(h.layer=g.layer,h.id=g.tempId,d.push(h)):e.push(g))}for(var i={},j=d.length,k=0;j>k;k++)i[k]=this._updateDatabase(d[k]);var l=c(i);l.then(function(a){e.length>0?b(!1,a):b(!0,a)},function(a){b(!1,a)})}else b(!0,{})},_updateDatabase:function(a){var c=new b,d={};return d.attributes={},d.attributes[this.DB_UID]=a.id,this._editStore["delete"](a.layer,d,function(a,b){a?c.resolve({success:!0,error:null}):c.reject({success:!1,error:b})}.bind(this)),c.promise},getFeatureLayerJSON:function(a,b){require(["esri/request"],function(c){var d=c({url:a,content:{f:"json"},handleAs:"json",callbackParamName:"callback"});d.then(function(a){b(!0,a)},function(a){b(!1,a.message)})})},_internalApplyEdits:function(a,c,d,e,f,g){var h=this,i=new b;return a._applyEdits(e,f,g,function(b,e,f){if(a._phantomLayer.clear(),null!=a._attachmentsStore&&a.hasAttachments&&d.length>0){var g=b.map(function(a){return a.objectId});a._replaceFeatureIds(d,g,function(a){})}h._cleanDatabase(a,d,b,e,f).then(function(g){i.resolve({id:c,layer:a.url,tempId:d,addResults:b,updateResults:e,deleteResults:f,databaseResults:g,databaseErrors:null})},function(g){i.resolve({id:c,layer:a.url,tempId:d,addResults:b,updateResults:e,deleteResults:f,databaseResults:null,databaseErrors:g})})},function(b){a.onEditsComplete=a.__onEditsComplete,delete a.__onEditsComplete,i.reject(b)}),i.promise},_internalApplyEditsAll:function(a,c,d,e,f,g){var h=this,i=new b;return this._makeEditRequest(a.url,e,f,g,function(b,f,g){if(a._phantomLayer.clear(),null!=a._attachmentsStore&&a.hasAttachments&&d.length>0){var j=b.map(function(a){return a.objectId});a._replaceFeatureIds(d,j,function(e){i.resolve({id:c,layer:a.url,tempId:d,addResults:b,updateResults:f,deleteResults:g,syncError:null})})}if(b.length>0){var k=new l(e[0].geometry,null,e[0].attributes);a.add(k)}h._cleanDatabase(a,d,b,f,g).then(function(e){i.resolve({id:c,layer:a.url,tempId:d,addResults:b,updateResults:f,deleteResults:g,databaseResults:e,databaseErrors:null,syncError:null})},function(e){i.resolve({id:c,layer:a.url,tempId:d,addResults:b,updateResults:f,deleteResults:g,databaseResults:null,databaseErrors:e,syncError:e})})},function(b){a.onEditsComplete=a.__onEditsComplete,delete a.__onEditsComplete,i.reject(b)}),i.promise},_cleanDatabase:function(a,c,d,e,f){var g=new b,h=null;e.length>0&&e[0].success&&(h=e[0].objectId),f.length>0&&f[0].success&&(h=f[0].objectId),d.length>0&&d[0].success&&(h=c);var i={};return i.attributes={},i.attributes[this.DB_UID]=h,this._editStore["delete"](a.url,i,function(a,b){if(a){var c=this._editStore.PHANTOM_GRAPHIC_PREFIX+this._editStore._PHANTOM_PREFIX_TOKEN+i.attributes[this.DB_UID];this._editStore.deletePhantomGraphic(c,function(a,b){a?g.resolve({success:!0,error:null,id:c}):g.reject({success:!1,error:b,id:c})})}else g.reject({success:!1,error:b,id:c})}.bind(this)),g.promise},_makeEditRequest:function(a,b,c,d,f,g){var h="f=json",i="",k="",l="";if(b.length>0&&(i="&adds="+JSON.stringify(b)),c.length>0&&(e.forEach(c,function(a){a.hasOwnProperty("infoTemplate")&&delete a.infoTemplate},this),k="&updates="+JSON.stringify(c)),d.length>0){var m=d[0].attributes[this.DB_UID];l="&deletes="+m}var n=h+i+k+l;j.hasOwnProperty("id")&&j.id.hasOwnProperty("credentials")&&e.forEach(j.id.credentials,function(b){b.server===a.split("/",3).join("/")&&(n=n+"&token="+b.token)},this);var o=new XMLHttpRequest;o.open("POST",a+"/applyEdits",!0),o.setRequestHeader("Content-type","application/x-www-form-urlencoded"),o.onload=function(){if(200===o.status&&""!==o.responseText)try{var a=JSON.parse(this.response);f(a.addResults,a.updateResults,a.deleteResults)}catch(b){g("Unable to parse xhr response",o)}},o.onerror=function(a){g(a)},o.ontimeout=function(){g("xhr timeout error")},o.timeout=this._defaultXhrTimeout,o.send(n)},_parseResponsesArray:function(a){var c=new b,d=0;for(var e in a)a.hasOwnProperty(e)&&(a[e].addResults.map(function(a){a.success||d++}),a[e].updateResults.map(function(a){a.success||d++}),a[e].deleteResults.map(function(a){a.success||d++}));return d>0?c.resolve(!1):c.resolve(!0),c.promise}})}),"undefined"!=typeof O?O.esri.Edit={}:(O={},O.esri={Edit:{}}),O.esri.Edit.EditStore=function(){"use strict";this._db=null,this._isDBInit=!1,this.dbName="features_store",this.objectStoreName="features",this.objectId="objectid",this.ADD="add",this.UPDATE="update",this.DELETE="delete",this.FEATURE_LAYER_JSON_ID="feature-layer-object-1001",this.FEATURE_COLLECTION_ID="feature-collection-object-1001",this.PHANTOM_GRAPHIC_PREFIX="phantom-layer",this._PHANTOM_PREFIX_TOKEN="|@|",this.isSupported=function(){return window.indexedDB?!0:!1},this.pushEdit=function(a,b,c,d){var e={id:b+"/"+c.attributes[this.objectId],operation:a,layer:b,type:c.geometry.type,graphic:c.toJson()};if("undefined"==typeof c.attributes[this.objectId])d(!1,"editsStore.pushEdit() - failed to insert undefined objectId into database. Did you set offlineFeaturesManager.DB_UID? "+JSON.stringify(c.attributes));else{var f=this._db.transaction([this.objectStoreName],"readwrite");f.oncomplete=function(a){d(!0)},f.onerror=function(a){d(!1,a.target.error.message)};var g=f.objectStore(this.objectStoreName);g.put(e)}},this.pushFeatureLayerJSON=function(a,b){"object"!=typeof a&&b(!1,"dataObject type is not an object.");var c=this._db;a.id=this.FEATURE_LAYER_JSON_ID,this.getFeatureLayerJSON(function(d,e){var f;if(d&&"undefined"!=typeof e){f=c.transaction([this.objectStoreName],"readwrite").objectStore(this.objectStoreName);for(var g in a)a.hasOwnProperty(g)&&(e[g]=a[g]);var h=f.put(e);h.onsuccess=function(){b(!0,null)},h.onerror=function(a){b(!1,a)}}else{var i=c.transaction([this.objectStoreName],"readwrite");i.oncomplete=function(a){b(!0,null)},i.onerror=function(a){b(!1,a.target.error.message)},f=i.objectStore(this.objectStoreName);try{f.put(a)}catch(j){b(!1,JSON.stringify(j))}}}.bind(this))},this.getFeatureLayerJSON=function(a){var b=this._db.transaction([this.objectStoreName],"readwrite").objectStore(this.objectStoreName),c=b.get(this.FEATURE_LAYER_JSON_ID);c.onsuccess=function(){var b=c.result;"undefined"!=typeof b?a(!0,b):a(!1,"nothing found")},c.onerror=function(b){a(!1,b)}},this.deleteFeatureLayerJSON=function(a){var b=this._db,c=null,d=this,e=this.FEATURE_LAYER_JSON_ID;require(["dojo/Deferred"],function(f){c=new f,c.then(function(b){d.editExists(e).then(function(b){a(!1,{message:"object was not deleted."})},function(b){a(!0,{message:"id does not exist"})})},function(b){a(!1,{message:"id does not exist"})}),d.editExists(e).then(function(a){var f=b.transaction([d.objectStoreName],"readwrite").objectStore(d.objectStoreName),g=f["delete"](e);g.onsuccess=function(){c.resolve(!0)},g.onerror=function(a){c.reject({success:!1,error:a})}},function(a){c.reject({success:!1,message:a})}.bind(this))})},this.pushPhantomGraphic=function(a,b){var c=this._db,d=this.PHANTOM_GRAPHIC_PREFIX+this._PHANTOM_PREFIX_TOKEN+a.attributes[this.objectId],e={id:d,graphic:a.toJson()},f=c.transaction([this.objectStoreName],"readwrite");f.oncomplete=function(a){b(!0,null)},f.onerror=function(a){b(!1,a.target.error.message)};var g=f.objectStore(this.objectStoreName);g.put(e)},this.getPhantomGraphicsArray=function(a){var b=[];if(null!==this._db){var c=this.PHANTOM_GRAPHIC_PREFIX,d=this._db.transaction([this.objectStoreName]).objectStore(this.objectStoreName).openCursor();d.onsuccess=function(d){var e=d.target.result;e&&e.value&&e.value.id?(-1!=e.value.id.indexOf(c)&&b.push(e.value),e["continue"]()):a(b,"end")}.bind(this),d.onerror=function(b){a(null,b)}}else a(null,"no db")},this._getPhantomGraphicsArraySimple=function(a){var b=[];if(null!==this._db){var c=this.PHANTOM_GRAPHIC_PREFIX,d=this._db.transaction([this.objectStoreName]).objectStore(this.objectStoreName).openCursor();d.onsuccess=function(d){var e=d.target.result;e&&e.value&&e.value.id?(-1!=e.value.id.indexOf(c)&&b.push(e.value.id),e["continue"]()):a(b,"end")}.bind(this),d.onerror=function(b){a(null,b)}}else a(null,"no db")},this.deletePhantomGraphic=function(a,b){var c=this._db,d=null,e=this;require(["dojo/Deferred"],function(f){d=new f,e.editExists(a).then(function(f){d.then(function(c){e.editExists(a).then(function(a){b(!1,"item was not deleted")},function(a){b(!0,"item successfully deleted")})},function(a){b(!1,a)});var g=c.transaction([e.objectStoreName],"readwrite").objectStore(e.objectStoreName),h=g["delete"](a);h.onsuccess=function(){d.resolve(!0)},h.onerror=function(a){d.reject({success:!1,error:a})}},function(a){b(!1,"item doesn't exist in db")})})},this.resetLimitedPhantomGraphicsQueue=function(a,b){if(Object.keys(a).length>0){var c=this._db,d=0,e=c.transaction([this.objectStoreName],"readwrite"),f=e.objectStore(this.objectStoreName);f.onerror=function(){d++},e.oncomplete=function(){b(0===d?!0:!1)};for(var g in a)if(a.hasOwnProperty(g)){var h=a[g],i=this.PHANTOM_GRAPHIC_PREFIX+this._PHANTOM_PREFIX_TOKEN+h.id;h.updateResults.length>0&&h.updateResults[0].success&&f["delete"](i),h.deleteResults.length>0&&h.deleteResults[0].success&&f["delete"](i),h.addResults.length>0&&h.addResults[0].success&&f["delete"](i)}}else b(!0)},this.resetPhantomGraphicsQueue=function(a){var b=this._db;this._getPhantomGraphicsArraySimple(function(c){if(c!=[]){var d=0,e=b.transaction([this.objectStoreName],"readwrite"),f=e.objectStore(this.objectStoreName);f.onerror=function(){d++},e.oncomplete=function(){a(0===d?!0:!1)};for(var g=c.length,h=0;g>h;h++)f["delete"](c[h])}else a(!0)}.bind(this))},this.getEdit=function(a,b){var c=this._db.transaction([this.objectStoreName],"readwrite").objectStore(this.objectStoreName);if("undefined"==typeof a)return void b(!1,"id is undefined.");var d=c.get(a);d.onsuccess=function(){var c=d.result;c&&c.id==a?b(!0,c):b(!1,"Id not found")},d.onerror=function(a){b(!1,a)}},this.getAllEdits=function(a){if(null!==this._db){var b=this.FEATURE_LAYER_JSON_ID,c=this.FEATURE_COLLECTION_ID,d=this.PHANTOM_GRAPHIC_PREFIX,e=this._db.transaction([this.objectStoreName]).objectStore(this.objectStoreName).openCursor();e.onsuccess=function(e){var f=e.target.result;f&&f.hasOwnProperty("value")&&f.value.hasOwnProperty("id")?(f.value.id!==b&&f.value.id!==c&&-1==f.value.id.indexOf(d)&&a(f.value,null),f["continue"]()):a(null,"end")}.bind(this),e.onerror=function(b){a(null,b)}}else a(null,"no db")},this.getAllEditsArray=function(a){var b=[];if(null!==this._db){var c=this.FEATURE_LAYER_JSON_ID,d=this.FEATURE_COLLECTION_ID,e=this.PHANTOM_GRAPHIC_PREFIX,f=this._db.transaction([this.objectStoreName]).objectStore(this.objectStoreName).openCursor();f.onsuccess=function(f){var g=f.target.result;g&&g.value&&g.value.id?(g.value.id!==c&&g.value.id!==d&&-1==g.value.id.indexOf(e)&&b.push(g.value),g["continue"]()):a(b,"end")}.bind(this),f.onerror=function(b){a(null,b)}}else a(null,"no db")},this.updateExistingEdit=function(a,b,c,d){var e=this._db.transaction([this.objectStoreName],"readwrite").objectStore(this.objectStoreName),f=e.get(c.attributes[this.objectId]);f.onsuccess=function(){f.result;var g={id:b+"/"+c.attributes[this.objectId],operation:a,layer:b,graphic:c.toJson()},h=e.put(g);h.onsuccess=function(){d(!0)},h.onerror=function(a){d(!1,a)}}.bind(this)},this["delete"]=function(a,b,c){var d=this._db,e=null,f=this,g=a+"/"+b.attributes[this.objectId];require(["dojo/Deferred"],function(a){e=new a,f.editExists(g).then(function(a){e.then(function(a){f.editExists(g).then(function(a){c(!1)},function(a){c(!0)})},function(a){c(!1,a)});var b=d.transaction([f.objectStoreName],"readwrite").objectStore(f.objectStoreName),h=b["delete"](g);h.onsuccess=function(){e.resolve(!0)},h.onerror=function(a){e.reject({success:!1,error:a})}},function(a){c(!1)})})},this.resetEditsQueue=function(a){var b=this._db.transaction([this.objectStoreName],"readwrite").objectStore(this.objectStoreName).clear();b.onsuccess=function(b){setTimeout(function(){a(!0)},0)},b.onerror=function(b){a(!1,b)}},this.pendingEditsCount=function(a){var b=0,c=this.FEATURE_LAYER_JSON_ID,d=this.FEATURE_COLLECTION_ID,e=this.PHANTOM_GRAPHIC_PREFIX,f=this._db.transaction([this.objectStoreName],"readwrite"),g=f.objectStore(this.objectStoreName);g.openCursor().onsuccess=function(f){var g=f.target.result;g&&g.value&&g.value.id&&-1==g.value.id.indexOf(e)?(g.value.id!==c&&g.value.id!==d&&b++,g["continue"]()):a(b)}},this.editExists=function(a){var b=this._db,c=null,d=this;return require(["dojo/Deferred"],function(e){c=new e;var f=b.transaction([d.objectStoreName],"readwrite").objectStore(d.objectStoreName),g=f.get(a);g.onsuccess=function(){var b=g.result;b&&b.id==a?c.resolve({success:!0,error:null}):c.reject({success:!1,error:"objectId is not a match."})},g.onerror=function(a){c.reject({success:!1,error:a})}}),c},this.getUsage=function(a){var b=this.FEATURE_LAYER_JSON_ID,c=this.FEATURE_COLLECTION_ID,d=this.PHANTOM_GRAPHIC_PREFIX,e={sizeBytes:0,editCount:0},f=this._db.transaction([this.objectStoreName]).objectStore(this.objectStoreName).openCursor();f.onsuccess=function(f){var g=f.target.result;if(g&&g.value&&g.value.id){var h=g.value,i=JSON.stringify(h);e.sizeBytes+=i.length,-1==g.value.id.indexOf(d)&&g.value.id!==b&&g.value.id!==c&&(e.editCount+=1),g["continue"]()}else a(e,null)},f.onerror=function(b){a(null,b)}},this._pushFeatureCollections=function(a,b){
var c=this._db.transaction([this.objectStoreName],"readwrite");c.oncomplete=function(a){b(!0)},c.onerror=function(a){b(!1,a.target.error.message)};var d=c.objectStore(this.objectStoreName);d.put(a)},this._getFeatureCollections=function(a){var b=this._db.transaction([this.objectStoreName],"readonly").objectStore(this.objectStoreName),c=b.get(this.FEATURE_COLLECTION_ID);c.onsuccess=function(){var b=c.result;"undefined"!=typeof b?a(!0,b):a(!1,null)},c.onerror=function(b){a(!1,b)}},this._serialize=function(a){var b=a.toJson(),c={attributes:b.attributes,geometry:b.geometry,infoTemplate:b.infoTemplate,symbol:b.symbol};return JSON.stringify(c)},this._deserialize=function(a){var b;return require(["esri/graphic"],function(c){b=new c(JSON.parse(a))}),b},this.init=function(a){var b=indexedDB.open(this.dbName,11);a=a||function(a){}.bind(this),b.onerror=function(b){a(!1,b.target.errorCode)}.bind(this),b.onupgradeneeded=function(a){var b=a.target.result;b.objectStoreNames.contains(this.objectStoreName)&&b.deleteObjectStore(this.objectStoreName),b.createObjectStore(this.objectStoreName,{keyPath:"id"})}.bind(this),b.onsuccess=function(b){this._db=b.target.result,this._isDBInit=!0,a(!0,null)}.bind(this)}},O.esri.Edit.AttachmentsStore=function(){"use strict";this._db=null,this.dbName="attachments_store",this.objectStoreName="attachments",this.TYPE={ADD:"add",UPDATE:"update",DELETE:"delete"},this.isSupported=function(){return window.indexedDB?!0:!1},this.store=function(a,b,c,d,e,f){try{e==this.TYPE.ADD||e==this.TYPE.UPDATE||e==this.TYPE.DELETE?this._readFile(d,function(g,h){if(g){var i={id:b,objectId:c,type:e,featureId:a+"/"+c,contentType:d.type,name:d.name,size:d.size,featureLayerUrl:a,content:h,file:d},j=this._db.transaction([this.objectStoreName],"readwrite");j.oncomplete=function(a){f(!0,i)},j.onerror=function(a){f(!1,a.target.error.message)};try{j.objectStore(this.objectStoreName).put(i)}catch(k){f(!1,k)}}else f(!1,h)}.bind(this)):f(!1,"attachmentsStore.store() Invalid type in the constructor!")}catch(g){f(!1,g.stack)}},this.retrieve=function(a,b){var c=this._db.transaction([this.objectStoreName]).objectStore(this.objectStoreName),d=c.get(a);d.onsuccess=function(a){var c=a.target.result;c?b(!0,c):b(!1,"not found")},d.onerror=function(a){b(!1,a)}},this.getAttachmentsByFeatureId=function(a,b,c){var d=a+"/"+b,e=[],f=this._db.transaction([this.objectStoreName]).objectStore(this.objectStoreName),g=f.index("featureId"),h=IDBKeyRange.only(d);g.openCursor(h).onsuccess=function(a){var b=a.target.result;b?(e.push(b.value),b["continue"]()):c(e)}},this.getAttachmentsByFeatureLayer=function(a,b){var c=[],d=this._db.transaction([this.objectStoreName]).objectStore(this.objectStoreName),e=d.index("featureLayerUrl"),f=IDBKeyRange.only(a);e.openCursor(f).onsuccess=function(a){var d=a.target.result;d?(c.push(d.value),d["continue"]()):b(c)}},this.getAllAttachments=function(a){var b=[],c=this._db.transaction([this.objectStoreName]).objectStore(this.objectStoreName);c.openCursor().onsuccess=function(c){var d=c.target.result;d?(b.push(d.value),d["continue"]()):a(b)}},this.deleteAttachmentsByFeatureId=function(a,b,c){var d=a+"/"+b,e=this._db.transaction([this.objectStoreName],"readwrite").objectStore(this.objectStoreName),f=e.index("featureId"),g=IDBKeyRange.only(d),h=0;f.openCursor(g).onsuccess=function(a){var b=a.target.result;b?(e["delete"](b.primaryKey),h++,b["continue"]()):setTimeout(function(){c(h)},0)}.bind(this)},this["delete"]=function(a,b){this.retrieve(a,function(c,d){if(!c)return void b(!1,"attachment "+a+" not found");var e=this._db.transaction([this.objectStoreName],"readwrite").objectStore(this.objectStoreName)["delete"](a);e.onsuccess=function(a){setTimeout(function(){b(!0)},0)},e.onerror=function(a){b(!1,a)}}.bind(this))},this.deleteAll=function(a){this.getAllAttachments(function(b){var c=this._db.transaction([this.objectStoreName],"readwrite").objectStore(this.objectStoreName).clear();c.onsuccess=function(b){setTimeout(function(){a(!0)},0)},c.onerror=function(b){a(!1,b)}}.bind(this))},this.replaceFeatureId=function(a,b,c,d){var e=a+"/"+b,f=this._db.transaction([this.objectStoreName],"readwrite").objectStore(this.objectStoreName),g=f.index("featureId"),h=IDBKeyRange.only(e),i=0;g.openCursor(h).onsuccess=function(b){var e=b.target.result;if(e){var g=a+"/"+c,h=e.value;h.featureId=g,h.objectId=c,f.put(h),i++,e["continue"]()}else setTimeout(function(){d(i)},1)}},this.getUsage=function(a){var b={sizeBytes:0,attachmentCount:0},c=this._db.transaction([this.objectStoreName]).objectStore(this.objectStoreName).openCursor();c.onsuccess=function(c){var d=c.target.result;if(d){var e=d.value,f=JSON.stringify(e);b.sizeBytes+=f.length,b.attachmentCount+=1,d["continue"]()}else a(b,null)}.bind(this),c.onerror=function(b){a(null,b)}},this.resetAttachmentsQueue=function(a){var b=this._db.transaction([this.objectStoreName],"readwrite").objectStore(this.objectStoreName).clear();b.onsuccess=function(b){setTimeout(function(){a(!0)},0)},b.onerror=function(b){a(!1,b)}},this._readFile=function(a,b){var c=new FileReader;c.onload=function(a){b(!0,a.target.result)},c.onerror=function(a){b(!1,a.target.result)},c.readAsBinaryString(a)},this.init=function(a){var b=indexedDB.open(this.dbName,12);a=a||function(a){}.bind(this),b.onerror=function(b){a(!1,b.target.errorCode)}.bind(this),b.onupgradeneeded=function(a){var b=a.target.result;b.objectStoreNames.contains(this.objectStoreName)&&b.deleteObjectStore(this.objectStoreName);var c=b.createObjectStore(this.objectStoreName,{keyPath:"id"});c.createIndex("featureId","featureId",{unique:!1}),c.createIndex("featureLayerUrl","featureLayerUrl",{unique:!1})}.bind(this),b.onsuccess=function(b){this._db=b.target.result,a(!0)}.bind(this)}};