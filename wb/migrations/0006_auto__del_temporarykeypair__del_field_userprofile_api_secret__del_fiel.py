# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting model 'TemporaryKeypair'
        db.delete_table(u'wb_temporarykeypair')

        # Deleting field 'UserProfile.api_secret'
        db.delete_column(u'wb_userprofile', 'api_secret')

        # Deleting field 'UserProfile.token_key'
        db.delete_column(u'wb_userprofile', 'token_key')

        # Deleting field 'UserProfile.api_key'
        db.delete_column(u'wb_userprofile', 'api_key')

        # Deleting field 'UserProfile.token_secret'
        db.delete_column(u'wb_userprofile', 'token_secret')


    def backwards(self, orm):
        # Adding model 'TemporaryKeypair'
        db.create_table(u'wb_temporarykeypair', (
            ('nonce', self.gf('django.db.models.fields.TextField')(max_length=64)),
            ('api_secret', self.gf('django.db.models.fields.TextField')(max_length=64)),
            ('token_key', self.gf('django.db.models.fields.TextField')(max_length=64)),
            ('api_key', self.gf('django.db.models.fields.TextField')(max_length=64)),
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('token_secret', self.gf('django.db.models.fields.TextField')(max_length=64)),
        ))
        db.send_create_signal(u'wb', ['TemporaryKeypair'])

        # Adding field 'UserProfile.api_secret'
        db.add_column(u'wb_userprofile', 'api_secret',
                      self.gf('django.db.models.fields.TextField')(default='', max_length=64),
                      keep_default=False)

        # Adding field 'UserProfile.token_key'
        db.add_column(u'wb_userprofile', 'token_key',
                      self.gf('django.db.models.fields.TextField')(default='', max_length=64),
                      keep_default=False)

        # Adding field 'UserProfile.api_key'
        db.add_column(u'wb_userprofile', 'api_key',
                      self.gf('django.db.models.fields.TextField')(default='', max_length=64),
                      keep_default=False)

        # Adding field 'UserProfile.token_secret'
        db.add_column(u'wb_userprofile', 'token_secret',
                      self.gf('django.db.models.fields.TextField')(default='', max_length=64),
                      keep_default=False)


    models = {
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'wb.hiddenpost': {
            'Meta': {'object_name': 'HiddenPost'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'post': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"})
        },
        u'wb.rule': {
            'Meta': {'unique_together': "(('user', 'keyword'),)", 'object_name': 'Rule'},
            'blacklist': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'index': ('django.db.models.fields.IntegerField', [], {}),
            'keyword': ('wb.models.LowerCaseCharField', [], {'max_length': '256'}),
            'regex': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'show_notification': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"}),
            'whole_word': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        u'wb.userprofile': {
            'Meta': {'object_name': 'UserProfile'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'user': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['auth.User']", 'unique': 'True'})
        },
        u'wb.whitelistuser': {
            'Meta': {'object_name': 'WhitelistUser'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'other_user': ('django.db.models.fields.TextField', [], {'max_length': '64'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"})
        }
    }

    complete_apps = ['wb']