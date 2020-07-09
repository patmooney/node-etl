describe('lib/database', function () {
    const EventEmitter = require('events');
    let childProcessMock, tmpMock, spawnEvents, sourceConfig, targetConfig;
    let originalNow = Date.now();
    beforeEach(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });
        sourceConfig = {
            cxn: {
                user: 'the-source-user',
                host: 'the-source-host',
                port: 'the-source-port',
                password: 'the-source-pw'
            },
            database: 'the-source-database'
        };
        targetConfig = {
            cxn: {
                user: 'the-target-user',
                host: 'the-target-host',
                port: 'the-target-port',
                password: 'the-target-pw'
            },
            database: 'the-target-database'
        };
        tmpMock = {
            file: chai.spy(() => Promise.resolve({ path: 'the-path' }))
        };
        spawnEvents = new EventEmitter();
        spawnEvents.stderr = { on: () => {} };
        childProcessMock = {
            spawn: chai.spy(() => spawnEvents)
        };
        mockery.registerMock('child_process', childProcessMock);
        mockery.registerMock('tmp-promise', tmpMock);
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.resetCache();
        mockery.disable();
        Date.now = originalNow;
    });

    describe('copySchema', function () {
        it('should fail if a cmd fails', async function () {
            Date.now = () => 5000;
            const { copySchema } = require('../../../lib/database');
            setTimeout(() =>{
                spawnEvents.emit('close', 0);
                setTimeout(() => {
                    spawnEvents.emit('close', 0);
                    setTimeout(() => {
                        spawnEvents.emit('close', 1);
                        setTimeout(() => spawnEvents.emit('close', 0), 0);
                    }, 0)
                }, 0)
            }, 0);
            await expect(copySchema(sourceConfig, targetConfig)).to.eventually.rejectedWith(undefined);
            expect(childProcessMock.spawn).on.nth(1).to.have.been.called.with(
                'psql', [
                    'postgresql://the-target-user:the-target-pw@the-target-host:the-target-port',
                    '-c', 'CREATE DATABASE tmp_5000'
                ]
            );
            expect(childProcessMock.spawn).on.nth(2).to.have.been.called.with(
                'pg_dump', [
                    '--dbname',
                    'postgresql://the-source-user:the-source-pw@the-source-host:the-source-port/the-source-database',
                    '-f', 'the-path', '-s'
                ]
            );
        });
    });
});
