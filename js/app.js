/**
 * 演示程序当前的 “注册/登录” 等操作，是基于 “本地存储” 完成的
 * 当您要参考这个演示程序进行相关 app 的开发时，
 * 请注意将相关方法调整成 “基于服务端Service” 的实现。
 **/
(function($, owner) {
	/**
	 * 用户登录
	 **/
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.account = loginInfo.account || '';
		loginInfo.password = loginInfo.password || '';
		if (loginInfo.account.length < 1) {
			return callback('请填写用户名');
		}
		if (loginInfo.password.length < 3) {
			return callback('密码最短为 3 个字符');
		}
		mui.ajax('http://47.100.199.31:8080/yangcong-1.0-SNAPSHOT/yc/user/login', {
			data: {
				userName: loginInfo.account,
				password: loginInfo.password
			},
			type: 'post',
			timeout: 10000, //超时时间设置为10秒；	              
			success: function(data) {
				if (data) {
					if (data.status == "success") {
						//存储当前用户和已登录标示
						var settings = owner.getSettings();
						settings.logged = true;
						settings.currentUser = data.data.uid;
						app.setSettings(settings);
						return callback();
					} else {
						return callback(data.msg);
					}
				} else {
					return callback('登录失败');
				}

			},
			error: function(xhr, type, errorThrown) {
				return callback('网络出错，请稍候再试');
			}
		})
	};

	/**
	 * 新用户注册
	 **/
	owner.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.account = regInfo.account || '';
		regInfo.password = regInfo.password || '';
		regInfo.phone = regInfo.phone || '';
		if (regInfo.account.length < 1) {
			return callback('请填写用户名');
		}
		if (regInfo.password.length < 3) {
			return callback('密码最短需要 3 个字符');
		}
		if (!checkPhone(regInfo.phone)) {
			return callback('手机号不合法');
		}
		mui.ajax('http://47.100.199.31:8080/yangcong-1.0-SNAPSHOT/yc/user/register', {
			data: {
				userName: regInfo.account,
				password: regInfo.password,
				phone: regInfo.phone
			},
			type: 'post',
			timeout: 10000, //超时时间设置为10秒；              
			success: function(data) {
				if (data) {
					if (data.status == "success") {
						return callback();
					} else {
						return callback(data.msg);
					}
				} else {
					return callback('注册失败')
				}

			},
			error: function(xhr, type, errorThrown) {
				return callback('网络出错，请稍候再试');
			}
		})
	};

	//手机号验证
	var checkPhone = function(phone) {
		var regchek = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/g;
		return phone.match(regchek);
	}

	/**
	 * 找回密码--获取用户手机号
	 **/
	owner.getPhone = function(username, callback) {
		mui.ajax('http://47.100.199.31:8080/yangcong-1.0-SNAPSHOT/yc/user/phone', {
			data: {
				userName: username
			},
			type: 'post',
			timeout: 3000, //超时时间设置为3秒；	              
			success: function(data) {
				if (data) {
					if (data) { //此套框架请求失败会默认返回html文档数据，所以可能不会触发error
						if (data.status == "success") {
							return callback(true, data.data);
						} else {
							return callback(false, data.msg);
						}
					} else {
						return callback(false, '操作失败');
					}
				} else {
					return callback(false, '操作失败');
				}

			},
			error: function(xhr, type, errorThrown) {
				return callback(false, '网络出错，请稍候再试');
			}
		})
	};

	/**
	 * 找回密码--发送验证码
	 **/
	owner.sendMessageForReg = function(phone, callback) {
		mui.ajax('http://tangguoyule.cn/tgadmin/duanxin/index', {
			data: {
				user_tel: phone
			},
			type: 'post',
			timeout: 10000, //超时时间设置为10秒；	              
			success: function(data) {
				if (data) {
					data = typeof JSON.parse(data) == "object" ? JSON.parse(data) : JSON.parse(JSON.parse(data));
					if (data) { //此套框架请求失败会默认返回html文档数据，所以可能不会触发error
						if (data.success) {
							return callback();
						} else {
							return callback('发送验证码失败');
						}
					} else {
						return callback('发送验证码失败');
					}
				} else {
					return callback('发送验证码失败');
				}

			},
			error: function(xhr, type, errorThrown) {
				return callback('网络出错，请稍候再试');
			}
		})
	};

	//验证用户验证码
	owner.checkMessageReg = function(forgetInfo, callback) {
		forgetInfo = forgetInfo || {};
		if (!forgetInfo.regCode) {
			return callback('请输入验证码');
		}
		mui.ajax('http://tangguoyule.cn/tgadmin/duanxin/check_code', {
			data: {
				mobile: forgetInfo.phone,
				mobile_code: forgetInfo.regCode
			},
			type: 'get',
			timeout: 10000, //超时时间设置为10秒；	              
			success: function(data) {
				if (data) {
					if (data.indexOf(200)>-1) {
						return callback();
					} else {
						return callback('验证码错误');
					}
				} else {
					return callback('验证码验证失败');
				}

			},
			error: function(xhr, type, errorThrown) {
				return callback('网络出错，请稍候再试');
			}
		})
	}

	//修改密码
	owner.changePassword = function(forgetInfo, callback) {
		mui.ajax('http://47.100.199.31:8080/yangcong-1.0-SNAPSHOT/yc/user/update/password', {
			data: {
				userName: forgetInfo.forgetAccount,
				password: forgetInfo.newPassword
			},
			type: 'post',
			timeout: 10000, //超时时间设置为10秒；	              
			success: function(data) {
				if (data) {
					if (data.status == "success") {
						return callback();
					} else {
						return callback(data.msg);
					}
				} else {
					return callback('保存失败');
				}

			},
			error: function(xhr, type, errorThrown) {
				return callback('网络出错，请稍候再试');
			}
		})
	}
	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}

	/* 紧急联系人保存 */
	owner.contactAdd = function(contactInfo, callback) {
		callback = callback || $.noop;
		contactInfo = contactInfo || {};
		contactInfo.uid = contactInfo.uid || 'anonymous';
		//紧急联系人
		if (!contactInfo.contactName || !contactInfo.contactPhone) {
			return callback('请填写以上信息');
		} else if (!checkPhone(contactInfo.contactPhone)) {
			return callback('请确认联系电话输入正确');
		}
		mui.ajax('http://47.100.199.31:8080/yangcong-1.0-SNAPSHOT/yc/contact/edit', {
			data: {
				contact: contactInfo.contactName,
				contactPhone: contactInfo.contactPhone,
				uid: contactInfo.uid
			},
			type: 'post',
			timeout: 10000, //超时时间设置为10秒；	              
			success: function(data) {
				if (data) {
					if (data.status == "success") {
						return callback();
					} else {
						return callback(data.msg);
					}
				} else {
					return callback('保存失败');
				}

			},
			error: function(xhr, type, errorThrown) {
				return callback('网络出错，请稍候再试');
			}
		})
	};
	/* 紧急联系人获取 */
	owner.contactGet = function(user, callback) {
		callback = callback || $.noop;
		user = user || 'anonymous';
		mui.ajax('http://47.100.199.31:8080/yangcong-1.0-SNAPSHOT/yc/contact/query', {
			data: {
				uid: user
			},
			type: 'post',
			timeout: 10000, //超时时间设置为10秒；	              
			success: function(data) {
				if (data) {
					if (data.status == "success") {
						return callback(true, data.data);
					} else {
						return callback(false, data.msg);
					}
				} else {
					return callback(false, '获取数据失败');
				}

			},
			error: function(xhr, type, errorThrown) {
				return callback(false, '网络出错，请稍候再试');
			}
		})
	};

	/* 急救档案保存 */
	owner.aidAdd = function(aidFileInfo, callback) {
		callback = callback || $.noop;
		aidFileInfo = aidFileInfo || {};
		aidFileInfo.uid = aidFileInfo.uid || 'anonymous';
		if (!aidFileInfo.name || !aidFileInfo.address || !aidFileInfo.case) {
			return callback('请填写以上信息');
		}
		mui.ajax('http://47.100.199.31:8080/yangcong-1.0-SNAPSHOT/yc/document/edit', {
			data: {
				realName: aidFileInfo.name,
				address: aidFileInfo.address,
				history: aidFileInfo.case,
				uid: aidFileInfo.uid
			},
			type: 'post',
			timeout: 10000, //超时时间设置为10秒；	              
			success: function(data) {
				if (data) {
					if (data.status == "success") {
						return callback();
					} else {
						return callback(data.msg);
					}
				} else {
					return callback('保存失败');
				}

			},
			error: function(xhr, type, errorThrown) {
				return callback('网络出错，请稍候再试');
			}
		})
	};
	/* 急救档案获取 */
	owner.aidGet = function(user, callback) {
		callback = callback || $.noop;
		user = user || 'anonymous';
		mui.ajax('http://47.100.199.31:8080/yangcong-1.0-SNAPSHOT/yc/document/query', {
			data: {
				uid: user
			},
			type: 'post',
			timeout: 10000, //超时时间设置为10秒；	              
			success: function(data) {
				if (data) {
					if (data.status == "success") {
						return callback(true, data.data);
					} else {
						return callback(false, data.msg);
					}
				} else {
					return callback(false, '获取数据失败');
				}

			},
			error: function(xhr, type, errorThrown) {
				return callback(false, '网络出错，请稍候再试');
			}
		})
	};

}(mui, window.app = {}));
