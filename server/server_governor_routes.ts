// =========================================================================
// Backend API Routes related to Governor Decrees and Templates
// Extracted from server.ts
// =========================================================================

// =================== PART 1: SECURED WITH requireGovernorOfficeApi ===================

  app.get(""/api/governor/decrees"", authenticate, async (_req: any, res: any) => {
    try {
      const result = await db.query(""SELECT * FROM governor_decrees ORDER BY id DESC"");
      const decrees = result.rows.map((row: any) => ({
        id: String(row.id),
        decreeNumber: row.decree_number,
        decreeDate: row.decree_date,
        location: row.location || 'Капитолий, город Лос-Сантос',
        governorNameHeader: row.governor_name,
        decreeTitle: row.decree_title,
        preamble: row.preamble,
        resolutionHeader: row.resolution_header || 'НАСТОЯЩИМ УКАЗЫВАЮ:',
        items: typeof row.items === 'string' ? JSON.parse(row.items || '[]') : (row.items || []),
        closingClause: row.closing_clause,
        governorRoleFooter: row.governor_role_footer,
        emblemUrl: row.emblem_url,
        sealUrl: row.seal_url,
        signatureUrl: row.signature_url,
        createdAt: row.created_at
      }));
      res.json(decrees);
    } catch (e: any) {
      console.error(""[GET /api/governor/decrees] Error:"", e);
      res.status(500).json({ error: ""Ошибка при получении списка указов"" });
    }
  });

  app.post(""/api/governor/decrees"", authenticate, requireGovernorOfficeApi, async (req: any, res: any) => {
    try {
      const {
        decreeNumber, decreeDate, location, governorNameHeader, decreeTitle,
        preamble, resolutionHeader, items, closingClause, governorRoleFooter,
        emblemUrl, sealUrl, signatureUrl
      } = req.body;

      const itemsStr = JSON.stringify(items || []);

      const insertRes = await db.query(
        INSERT INTO governor_decrees (
          decree_number, decree_date, location, governor_name, decree_title,
          preamble, resolution_header, items, closing_clause, governor_role_footer,
          emblem_url, seal_url, signature_url, author_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *,
        [
          decreeNumber || '473',
          decreeDate || new Date().toLocaleDateString('ru-RU'),
          location || 'Капитолий, город Лос-Сантос',
          governorNameHeader || 'FRIEDRICH ENGELMANN',
          decreeTitle || 'О КАДРОВЫХ КОРРЕКТИРОВКАХ',
          preamble || '',
          resolutionHeader || 'НАСТОЯЩИМ УКАЗЫВАЮ:',
          itemsStr,
          closingClause || 'ДОПОЛНИТЕЛЬНО УКАЗЫВАЕТСЯ, что настоящий указ вступает в законную силу с момента его публикации.',
          governorRoleFooter || 'FRIEDRICH ENGELMANN, ГУБЕРНАТОР',
          emblemUrl || '/governor/governor_emblem.png',
          sealUrl || '/governor/governor_seal.png',
          signatureUrl || '/governor/governor_signature.png',
          req.user.id
        ]
      );

      const row = insertRes.rows[0];
      const savedDoc = {
        id: String(row.id),
        decreeNumber: row.decree_number,
        decreeDate: row.decree_date,
        location: row.location,
        governorNameHeader: row.governor_name,
        decreeTitle: row.decree_title,
        preamble: row.preamble,
        resolutionHeader: row.resolution_header,
        items: JSON.parse(row.items || '[]'),
        closingClause: row.closing_clause,
        governorRoleFooter: row.governor_role_footer,
        emblemUrl: row.emblem_url,
        sealUrl: row.seal_url,
        signatureUrl: row.signature_url,
        createdAt: row.created_at
      };

      broadcast('UPDATE');
      res.json({ success: true, decree: savedDoc });
    } catch (e: any) {
      console.error(""[POST /api/governor/decrees] Error:"", e);
      res.status(500).json({ error: ""Ошибка при создании указа"" });
    }
  });

  app.delete(""/api/governor/decrees/:id"", authenticate, requireGovernorOfficeApi, async (req: any, res: any) => {
    try {
      const { id } = req.params;
      await db.query(""DELETE FROM governor_decrees WHERE id = $1"", [id]);
      broadcast('UPDATE');
      res.json({ success: true });
    } catch (e: any) {
      console.error(""[DELETE /api/governor/decrees] Error:"", e);
      res.status(500).json({ error: ""Ошибка при удалении указа"" });
    }
  });

// =================== PART 2: TEMPLATES ===================

  // Governor Decree Templates (Preset texts)
  app.get(""/api/governor/templates"", async (req: any, res) => {
    try {
      const rows = (await db.query(SELECT * FROM governor_decree_templates ORDER BY created_at DESC)).rows;
      res.json(rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        decreeTitle: r.decree_title || r.decreetitle || '',
        decree_title: r.decree_title || r.decreetitle || '',
        preamble: r.preamble || '',
        resolutionHeader: r.resolution_header || r.resolutionheader || '',
        resolution_header: r.resolution_header || r.resolutionheader || '',
        items: typeof r.items === 'string' ? (JSON.parse(r.items) || []) : (r.items || []),
        closingClause: r.closing_clause || r.closingclause || '',
        closing_clause: r.closing_clause || r.closingclause || '',
        createdBy: r.created_by || r.createdby || 'Губернатор',
        created_by: r.created_by || r.createdby || 'Губернатор'
      })));
    } catch (e) {
      console.error('[Governor Templates GET]', e);
      res.status(500).json({ error: 'Ошибка загрузки шаблонов' });
    }
  });

  app.post(""/api/governor/templates"", authenticate, async (req: any, res) => {
    try {
      const title = req.body.title;
      const decreeTitle = req.body.decreeTitle || req.body.decree_title || '';
      const preamble = req.body.preamble || '';
      const resolutionHeader = req.body.resolutionHeader || req.body.resolution_header || '';
      const items = Array.isArray(req.body.items) ? req.body.items : [];
      const closingClause = req.body.closingClause || req.body.closing_clause || '';

      if (!title || !title.trim()) return res.status(400).json({ error: 'Название шаблона обязательно' });

      const id = 	pl-$Date.now();
      const itemsStr = JSON.stringify(items);
      const createdBy = req.user?.full_name || req.user?.login || 'Губернатор';

      await db.query(
        INSERT INTO governor_decree_templates (id, title, decree_title, preamble, resolution_header, items, closing_clause, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      , [id, title.trim(), decreeTitle, preamble, resolutionHeader, itemsStr, closingClause, createdBy]);

      res.json({
        success: true,
        template: {
          id,
          title: title.trim(),
          decreeTitle,
          decree_title: decreeTitle,
          preamble,
          resolutionHeader,
          resolution_header: resolutionHeader,
          items,
          closingClause,
          closing_clause: closingClause,
          createdBy,
          created_by: createdBy
        }
      });
    } catch (e) {
      console.error('[Governor Templates POST]', e);
      res.status(500).json({ error: 'Ошибка сохранения шаблона' });
    }
  });

  app.delete(""/api/governor/templates/:id"", authenticate, async (req: any, res) => {
    try {
      const { id } = req.params;
      await db.query(DELETE FROM governor_decree_templates WHERE id = $1, [id]);
      res.json({ success: true });
    } catch (e) {
      console.error('[Governor Templates DELETE]', e);
      res.status(500).json({ error: 'Ошибка удаления шаблона' });
    }
  });
